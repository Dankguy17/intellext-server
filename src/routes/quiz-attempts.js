const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

// Get all attempts for the current user
router.get('/', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .populate('quiz', 'title subject difficulty')
      .sort({ completedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get attempts for a specific quiz
router.get('/quiz/:quizId', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      user: req.user.id,
      quiz: req.params.quizId
    }).sort({ completedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit a new quiz attempt
router.post('/', auth, async (req, res) => {
  try {
    const { quiz: quizId, score, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const attempt = new QuizAttempt({
      user: req.user.id,
      quiz: quizId,
      score,
      answers
    });

    await attempt.save();
    res.json(attempt);
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
