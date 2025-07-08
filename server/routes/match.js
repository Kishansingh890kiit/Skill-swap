import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { getSkillsEmbedding } from '../utils/openai.js';

const router = express.Router();

// Cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

// @route   GET /api/matches
// @desc    Get potential matches for the current user (semantic)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // Find all other users
    const otherUsers = await User.find({ _id: { $ne: currentUser._id } }).select('-password');

    // Compute match score using keyword overlap only
    const matchesWithScore = otherUsers.map(match => {
      // How well their skillsHave matches my skillsWant, and vice versa
      let teachScore = 0, learnScore = 0;
      if (match.skillsHave && currentUser.skillsWant) {
        teachScore = match.skillsHave.filter(skill => currentUser.skillsWant.includes(skill)).length / (currentUser.skillsWant.length || 1);
      }
      if (match.skillsWant && currentUser.skillsHave) {
        learnScore = match.skillsWant.filter(skill => currentUser.skillsHave.includes(skill)).length / (currentUser.skillsHave.length || 1);
      }
      const totalScore = (teachScore + learnScore) / 2;
      return {
        ...match.toObject(),
        matchScore: { teachScore, learnScore, totalScore }
      };
    });

    // Sort by totalScore descending
    const sortedMatches = matchesWithScore.sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore);
    res.json(sortedMatches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/matches/request
// @desc    Request a match with another user
// @access  Private
router.post('/request', protect, async (req, res) => {
  try {
    const { targetUserId, message } = req.body;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // TODO: Create a MatchRequest model and save the request
    // For now, just return success
    res.json({ message: 'Match request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get matches for current user
router.get('/simple', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all other users
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name email profilePicture skillsHave skillsWant');

    // Calculate match scores
    const matches = users.map(user => {
      // Calculate how many skills the current user wants that the other user has
      const skillsToLearn = currentUser.skillsWant.filter(skill => 
        user.skillsHave.includes(skill)
      );

      // Calculate how many skills the other user wants that the current user has
      const skillsToTeach = user.skillsWant.filter(skill => 
        currentUser.skillsHave.includes(skill)
      );

      // Calculate match score (simple version)
      const totalPossibleMatches = currentUser.skillsWant.length + user.skillsWant.length;
      const actualMatches = skillsToLearn.length + skillsToTeach.length;
      const matchScore = totalPossibleMatches > 0 ? actualMatches / totalPossibleMatches : 0;

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        skillsToLearn,
        skillsToTeach,
        matchScore
      };
    });

    // Sort matches by score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 