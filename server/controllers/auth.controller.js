const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, age, gender, height, weight, activityLevel, fitnessGoal } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Create user with all profile fields, explicitly setting role to 'user'
    const user = await User.create({ name, email: normalizedEmail, password, role: 'user', age, gender, height, weight, activityLevel, fitnessGoal });

    // Generate JWT
    const token = generateToken(user);

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      role: user.role,
      activityLevel: user.activityLevel,
      fitnessGoal: user.fitnessGoal,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    // Find user and include password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = generateToken(user);

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activityLevel,
      fitnessGoal: user.fitnessGoal,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
