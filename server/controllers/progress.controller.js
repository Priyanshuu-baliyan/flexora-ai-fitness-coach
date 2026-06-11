const Progress = require('../models/Progress');

/**
 * @desc    Add a progress entry
 * @route   POST /api/progress
 */
const addProgress = async (req, res, next) => {
  try {
    const { weight, bmi, caloriesBurned, workoutCompleted, notes, date } = req.body;

    const progress = await Progress.create({
      userId: req.user.id,
      weight,
      bmi,
      caloriesBurned,
      workoutCompleted,
      notes,
      date: date || Date.now(),
    });

    res.status(201).json({
      message: 'Progress entry added',
      progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get progress entries for current user
 * @route   GET /api/progress
 */
const getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(90);

    res.json({ progress });
  } catch (error) {
    next(error);
  }
};

module.exports = { addProgress, getProgress };
