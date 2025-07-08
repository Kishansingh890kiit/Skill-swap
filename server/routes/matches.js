import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import { getSkillsEmbedding } from '../utils/openai.js';

const router = express.Router();

// Get matches for the current user
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all other users
    const users = await User.find({ _id: { $ne: currentUser.id } });

    // Calculate matches
    const matches = await Promise.all(users.map(async (user) => {
      // Calculate match score based on skills (keyword overlap only)
      const skillsToLearn = currentUser.skillsWant.filter(skill => 
        user.skillsHave.includes(skill)
      );
      
      const skillsToTeach = currentUser.skillsHave.filter(skill => 
        user.skillsWant.includes(skill)
      );

      // Calculate match score (simple version)
      const matchScore = (skillsToLearn.length + skillsToTeach.length) / 
        (currentUser.skillsWant.length + currentUser.skillsHave.length) * 100;

      return {
        user: {
          id: user._id,
          name: user.name,
          profilePicture: user.profilePicture,
          skillsHave: user.skillsHave,
          skillsWant: user.skillsWant,
          reputation: user.reputation
        },
        matchScore: Math.round(matchScore),
        skillsToLearn,
        skillsToTeach
      };
    }));

    // Sort matches by score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ message: 'Error finding matches' });
  }
});

export default router; 