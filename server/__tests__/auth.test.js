const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

// Use a test database
beforeAll(async () => {
  const testUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/flexora_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testUri);
  }
});

afterAll(async () => {
  await User.deleteMany({ email: /test@/ });
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@flexora.com`,
    password: 'test123456',
    age: 25,
    gender: 'male',
    height: 175,
    weight: 70,
    activityLevel: 'moderate',
    fitnessGoal: 'buildMuscle',
  };

  let token;

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty('password');
      token = res.body.token;
    });

    it('should reject duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(400);
    });

    it('should reject missing name', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com', password: '123456' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject short password', async () => {
      const res = await request(app).post('/api/auth/register').send({ name: 'A', email: 'y@y.com', password: '12' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'noone@none.com', password: '123456' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Protected Routes', () => {
    it('should access profile with valid token', async () => {
      const res = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/profile');
      expect(res.statusCode).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app).get('/api/profile').set('Authorization', 'Bearer invalidtoken');
      expect(res.statusCode).toBe(401);
    });
  });
});
