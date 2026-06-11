const { generateWorkoutPlan } = require('../services/workout.service');
const { generateDietPlan } = require('../services/diet.service');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');

/**
 * @desc    Generate AI workout plan
 * @route   POST /api/ai/workout
 */
const generateWorkout = async (req, res, next) => {
  try {
    const {
      age,
      weight,
      height,
      goal,
      experienceLevel,
      availableDays,
      focusArea,
      seed,
      previousPlan,
    } = req.body;

    const userData = {
      age,
      weight,
      height,
      goal,
      experienceLevel,
      availableDays,
      focusArea,
      seed,
      previousPlan,
    };

    const generatedPlan = await generateWorkoutPlan(userData);

    // Save to database, upserting to keep only one active plan per user
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { userId: req.user._id },
      { ...generatedPlan, userId: req.user._id },
      { upsert: true, new: true }
    );

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({
      message: 'Workout plan generated successfully',
      plan: workoutPlan,
    });
  } catch (error) {
    console.error('Workout generation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate workout plan. Please try again.',
    });
  }
};

/**
 * @desc    Generate AI diet plan
 * @route   POST /api/ai/diet
 */
const generateDiet = async (req, res, next) => {
  try {
    const {
      weight,
      goal,
      dietaryPreference,
      activityLevel,
      allergies,
      mealsPerDay,
      seed,
      previousPlan,
    } = req.body;

    const userData = {
      weight,
      goal,
      dietaryPreference,
      activityLevel,
      allergies,
      mealsPerDay,
      seed,
      previousPlan,
    };

    const generatedPlan = await generateDietPlan(userData);

    // Save to database, upserting to keep only one active plan per user
    const dietPlan = await DietPlan.findOneAndUpdate(
      { userId: req.user._id },
      { ...generatedPlan, userId: req.user._id },
      { upsert: true, new: true }
    );

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({
      message: 'Diet plan generated successfully',
      plan: dietPlan,
    });
  } catch (error) {
    console.error('Diet generation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate diet plan. Please try again.',
    });
  }
};

module.exports = { generateWorkout, generateDiet };
