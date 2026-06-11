const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
  },
  bmi: {
    type: Number,
  },
  caloriesBurned: {
    type: Number,
    default: 0,
  },
  workoutCompleted: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

progressSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);
