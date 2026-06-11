const express = require('express');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const { getUsers, deleteUser, getAnalytics, getWorkouts, updateWorkout, getDiets, updateDiet } = require('../controllers/admin.controller');

const router = express.Router();

// GET /api/admin/users - List all users (paginated)
router.get('/users', auth, admin, getUsers);

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', auth, admin, deleteUser);

// GET /api/admin/analytics - Platform analytics
router.get('/analytics', auth, admin, getAnalytics);

// GET /api/admin/workouts - List all workouts
router.get('/workouts', auth, admin, getWorkouts);

// PUT /api/admin/workouts/:id - Update a workout
router.put('/workouts/:id', auth, admin, updateWorkout);

// GET /api/admin/diets - List all diets
router.get('/diets', auth, admin, getDiets);

// PUT /api/admin/diets/:id - Update a diet
router.put('/diets/:id', auth, admin, updateDiet);

module.exports = router;
