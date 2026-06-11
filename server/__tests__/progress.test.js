const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Progress = require('../models/Progress');

let token;
let userId;

beforeAll(async () => {
  const testUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/flexora_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testUri);
  }
  // Create test user
  const res = await request(app).post('/api/auth/register').send({
    name: 'Progress Tester',
    email: `progress_test${Date.now()}@flexora.com`,
    password: 'test123456',
    age: 28, gender: 'male', height: 180, weight: 80,
    activityLevel: 'active', fitnessGoal: 'buildMuscle',
  });
  token = res.body.token;
  userId = res.body.user._id;
});

afterAll(async () => {
  await Progress.deleteMany({ userId });
  await User.deleteOne({ _id: userId });
  await mongoose.connection.close();
});

describe('Progress Endpoints', () => {
  describe('POST /api/progress', () => {
    it('should add a progress entry', async () => {
      const res = await request(app)
        .post('/api/progress')
        .set('Authorization', `Bearer ${token}`)
        .send({ weight: 79.5, bmi: 24.5, caloriesBurned: 350, workoutCompleted: true, notes: 'Good session' });
      expect(res.statusCode).toBe(201);
      expect(res.body.progress).toHaveProperty('_id');
      expect(res.body.progress.weight).toBe(79.5);
    });

    it('should reject without auth', async () => {
      const res = await request(app).post('/api/progress').send({ weight: 80 });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/progress', () => {
    it('should get progress entries', async () => {
      const res = await request(app)
        .get('/api/progress')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.progress)).toBe(true);
      expect(res.body.progress.length).toBeGreaterThan(0);
    });
  });
});
