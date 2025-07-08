import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { getSkillsEmbedding } from '../utils/openai.js';

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile (name, bio, skills) and regenerate embeddings
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, skillsHave, skillsWant } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skillsHave !== undefined) user.skillsHave = skillsHave;
    if (skillsWant !== undefined) user.skillsWant = skillsWant;

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      skillsHave: user.skillsHave,
      skillsWant: user.skillsWant,
      coins: user.coins,
      rating: user.rating,
      ratingCount: user.ratingCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 