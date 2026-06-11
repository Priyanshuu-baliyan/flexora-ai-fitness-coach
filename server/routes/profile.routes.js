const express = require('express');
const auth = require('../middleware/auth.middleware');
const uploadAvatar = require('../middleware/upload.middleware');
const { getProfile, updateProfile } = require('../controllers/profile.controller');

const router = express.Router();

// GET /api/profile - Get current user profile
router.get('/', auth, getProfile);

// PUT /api/profile - Update profile fields
router.put('/', auth, updateProfile);

// PUT /api/profile/avatar - Upload avatar image
router.put('/avatar', auth, uploadAvatar, updateProfile);

module.exports = router;
