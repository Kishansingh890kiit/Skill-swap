import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Chat from './models/Chat.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import matchRoutes from './routes/matches.js';
import chatRoutes from './routes/chat.js';
import aiRoutes from './routes/ai.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'SkillSwap Hub API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

// Socket.IO connection handling
const connectedUsers = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user._id);
  connectedUsers.set(socket.user._id.toString(), socket.id);

  // Handle joining chat rooms
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
  });

  // Handle new messages
  socket.on('send_message', async (data) => {
    try {
      const { chatId, content } = data;
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        return;
      }

      const message = {
        sender: socket.user._id,
        content,
        timestamp: new Date()
      };

      chat.messages.push(message);
      chat.lastMessage = new Date();
      await chat.save();

      // Emit to all users in the chat room
      io.to(chatId).emit('new_message', {
        chatId,
        message: {
          ...message,
          sender: {
            _id: socket.user._id,
            name: socket.user.name,
            email: socket.user.email,
            profilePicture: socket.user.profilePicture
          }
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Handle typing status
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user_typing', {
      chatId: data.chatId,
      userId: socket.user._id
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user._id);
    connectedUsers.delete(socket.user._id.toString());
  });
});

// MongoDB connection
console.log('MONGO_URI:', process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3002;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 