import express from 'express';
import { getGroqChatCompletion } from '../utils/openai.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { messages } = req.body;
  try {
    const aiReply = await getGroqChatCompletion(messages);
    res.json({ reply: aiReply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI-powered search endpoint
router.post('/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });
  try {
    // Get all users and skills
    const users = await User.find().select('name skillsHave skillsWant profilePicture');
    // Use Groq to find the most relevant users/skills
    const prompt = `Given the following users and their skills, return a JSON array of the most relevant users and skills for the search: "${query}".\n\nUsers: ${JSON.stringify(users)}\n\nReturn format: [{ name, profilePicture, skillsHave, skillsWant }]`;
    const aiReply = await getGroqChatCompletion([prompt]);
    let results = [];
    try {
      results = JSON.parse(aiReply);
    } catch (e) {
      // fallback: return all users
      results = users;
    }
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 