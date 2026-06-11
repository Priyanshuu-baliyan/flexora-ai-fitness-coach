const express = require('express');
const auth = require('../middleware/auth.middleware');
const { generateWorkout, generateDiet } = require('../controllers/ai.controller');

const router = express.Router();

// POST /api/ai/workout - Generate AI workout plan
router.post('/workout', auth, generateWorkout);

// POST /api/ai/diet - Generate AI diet plan
router.post('/diet', auth, generateDiet);

module.exports = router;
