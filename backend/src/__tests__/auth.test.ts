import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import { UserModel } from '../models/User';
import './setup';

// Mock rate limiter to avoid rate limiting in tests
jest.mock('../middleware/rateLimiter', () => ({
  rateLimiter: () => (req: any, res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user account', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'candidate',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.name).toBe('Test User');
      expect(response.body.user.role).toBe('candidate');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject signup with missing fields', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject signup with duplicate email', async () => {
      // Create first user
      await request(app).post('/api/auth/signup').send({
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        name: 'First User',
        role: 'candidate',
      });

      // Try to create second user with same email
      const response = await request(app).post('/api/auth/signup').send({
        email: 'duplicate@example.com',
        password: 'DifferentPass456!',
        name: 'Second User',
        role: 'candidate',
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('ALREADY_EXISTS');
    });

    it('should reject signup with invalid email', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'candidate',
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post('/api/auth/signup').send({
        email: 'signin@example.com',
        password: 'SecurePass123!',
        name: 'Signin User',
        role: 'candidate',
      });
    });

    it('should authenticate user with valid credentials', async () => {
      const response = await request(app).post('/api/auth/signin').send({
        email: 'signin@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('signin@example.com');
    });

    it('should reject signin with invalid email', async () => {
      const response = await request(app).post('/api/auth/signin').send({
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject signin with invalid password', async () => {
      const response = await request(app).post('/api/auth/signin').send({
        email: 'signin@example.com',
        password: 'WrongPassword!',
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject signin with missing fields', async () => {
      const response = await request(app).post('/api/auth/signin').send({
        email: 'signin@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create and signin a user to get refresh token
      const signupResponse = await request(app).post('/api/auth/signup').send({
        email: 'refresh@example.com',
        password: 'SecurePass123!',
        name: 'Refresh User',
        role: 'candidate',
      });

      refreshToken = signupResponse.body.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({
        refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject refresh with missing token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({
        refreshToken: 'invalid-token',
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Auth Flow Integration', () => {
    it('should complete full auth flow: signup -> signin -> refresh', async () => {
      // Step 1: Signup
      const signupResponse = await request(app).post('/api/auth/signup').send({
        email: 'flow@example.com',
        password: 'SecurePass123!',
        name: 'Flow User',
        role: 'candidate',
      });

      expect(signupResponse.status).toBe(201);
      const userId = signupResponse.body.user.id;

      // Step 2: Signin
      const signinResponse = await request(app).post('/api/auth/signin').send({
        email: 'flow@example.com',
        password: 'SecurePass123!',
      });

      expect(signinResponse.status).toBe(200);
      expect(signinResponse.body.user.id).toBe(userId);

      // Step 3: Refresh
      const refreshResponse = await request(app).post('/api/auth/refresh').send({
        refreshToken: signinResponse.body.refreshToken,
      });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body).toHaveProperty('accessToken');
    });
  });
});
