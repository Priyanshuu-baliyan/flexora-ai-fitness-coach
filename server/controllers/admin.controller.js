const User = require('../models/User');
const Progress = require('../models/Progress');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');

/**
 * @desc    Get all users (paginated)
 * @route   GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user and their progress data
 * @route   DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Delete user's progress entries, workouts, and diets
    await Progress.deleteMany({ userId: id });
    await WorkoutPlan.deleteMany({ userId: id });
    await DietPlan.deleteMany({ userId: id });

    // Delete the user
    await User.findByIdAndDelete(id);

    res.json({ message: 'User and associated data deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform analytics
 * @route   GET /api/admin/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, newUsersThisMonth, totalProgressEntries] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Progress.countDocuments(),
    ]);

    res.json({
      analytics: {
        totalUsers,
        newUsersThisMonth,
        totalProgressEntries,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all workout plans
 * @route   GET /api/admin/workouts
 */
const getWorkouts = async (req, res, next) => {
  try {
    const workouts = await WorkoutPlan.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ workouts });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a workout plan
 * @route   PUT /api/admin/workouts/:id
 */
const updateWorkout = async (req, res, next) => {
  try {
    const workout = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workout) return res.status(404).json({ error: 'Workout plan not found' });
    res.json({ message: 'Workout plan updated', workout });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all diet plans
 * @route   GET /api/admin/diets
 */
const getDiets = async (req, res, next) => {
  try {
    const diets = await DietPlan.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ diets });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a diet plan
 * @route   PUT /api/admin/diets/:id
 */
const updateDiet = async (req, res, next) => {
  try {
    const diet = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!diet) return res.status(404).json({ error: 'Diet plan not found' });
    res.json({ message: 'Diet plan updated', diet });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, deleteUser, getAnalytics, getWorkouts, updateWorkout, getDiets, updateDiet };
