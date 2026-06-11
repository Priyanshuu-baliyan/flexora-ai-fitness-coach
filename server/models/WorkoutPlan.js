const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planName: { type: String, default: 'Workout Plan' },
    description: String,
    durationWeeks: Number,
    daysPerWeek: Number,
    workouts: [
      {
        day: String,
        focus: String,
        warmup: String,
        cooldown: String,
        estimatedDurationMinutes: Number,
        exercises: [
          {
            name: String,
            sets: Number,
            reps: String,
            restSeconds: Number,
            rest: String,
            notes: String,
          },
        ],
      },
    ],
    tips: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
