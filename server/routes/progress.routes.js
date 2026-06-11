const express = require('express');
const auth = require('../middleware/auth.middleware');
const { addProgress, getProgress } = require('../controllers/progress.controller');

const router = express.Router();

// POST /api/progress - Add progress entry
router.post('/', auth, addProgress);

// GET /api/progress - Get progress history
router.get('/', auth, getProgress);

module.exports = router;
