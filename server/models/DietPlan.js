const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planName: { type: String, default: 'Diet Plan' },
    dailyCalories: Number,
    macros: {
      protein: String,
      carbs: String,
      fat: String,
    },
    meals: [
      {
        meal: String,
        time: String,
        totalCalories: Number,
        foods: [
          {
            name: String,
            portion: String,
            calories: Number,
            protein: String,
            carbs: String,
            fat: String,
          },
        ],
      },
    ],
    snacks: [
      {
        name: String,
        portion: String,
        calories: Number,
      },
    ],
    hydration: String,
    tips: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DietPlan', dietPlanSchema);
