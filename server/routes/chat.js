import express from 'express';
import { auth } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

const router = express.Router();

const DEFAULT_LIMIT = 50;

// Get all chats for a user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name email profilePicture')
      .sort({ lastMessage: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const { limit = DEFAULT_LIMIT, skip = 0 } = req.query;

    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'name email profilePicture')
      .populate('messages.sender', 'name email profilePicture')
      .lean();

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    // Paginate messages (from the end)
    const totalMessages = chat.messages.length;
    const start = Math.max(0, totalMessages - Number(skip) - Number(limit));
    const end = totalMessages - Number(skip);
    chat.messages = chat.messages.slice(start, end);

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new chat
router.post('/', auth, async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] }
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // Verify participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const chat = new Chat({
      participants: [req.user._id, participantId],
      messages: []
    });

    await chat.save();
    await chat.populate('participants', 'name email profilePicture');
    
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 