const express = require('express');
const auth = require('../middleware/auth.middleware');
const { sendMessage } = require('../controllers/chat.controller');

const router = express.Router();

// POST /api/chat - Send message to AI coach
router.post('/', auth, sendMessage);

module.exports = router;
