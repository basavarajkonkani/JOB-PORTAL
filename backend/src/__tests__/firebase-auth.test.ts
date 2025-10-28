import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import { auth, firestore } from '../config/firebase';
import { authenticateFirebase, authorizeFirebase } from '../middleware/firebaseAuth';

// Mock rate limiter to avoid rate limiting in tests
jest.mock('../middleware/rateLimiter', () => ({
  rateLimiter: () => (req: any, res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// Test route for token verification
const testRouter = express.Router();
testRouter.get('/protected', authenticateFirebase, (req: any, res) => {
  res.json({ user: req.user });
});
testRouter.get(
  '/candidate-only',
  authenticateFirebase,
  authorizeFirebase('candidate'),
  (req: any, res) => {
    res.json({ message: 'Candidate access granted' });
  }
);
testRouter.get(
  '/recruiter-only',
  authenticateFirebase,
  authorizeFirebase('recruiter'),
  (req: any, res) => {
    res.json({ message: 'Recruiter access granted' });
  }
);
testRouter.get('/admin-only', authenticateFirebase, authorizeFirebase('admin'), (req: any, res) => {
  res.json({ message: 'Admin access granted' });
});
app.use('/api/test', testRouter);

describe('Firebase Authentication Integration Tests', () => {
  // Cleanup function to delete test users
  const testUsers: string[] = [];

  afterEach(async () => {
    // Clean up test users from Firebase Auth and Firestore
    for (const uid of testUsers) {
      try {
        await auth.deleteUser(uid);
      } catch (error) {
        // User might not exist
      }
      try {
        await firestore.collection('users').doc(uid).delete();
      } catch (error) {
        // Document might not exist
      }
    }
    testUsers.length = 0;
  });

  describe('User Signup Flow', () => {
    it('should create a new user in Firebase Auth and Firestore', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'firebase-test@example.com',
        password: 'SecurePass123!',
        name: 'Firebase Test User',
        role: 'candidate',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('firebase-test@example.com');
      expect(response.body.user.name).toBe('Firebase Test User');
      expect(response.body.user.role).toBe('candidate');
      expect(response.body.user).toHaveProperty('id');

      const userId = response.body.user.id;
      testUsers.push(userId);

      // Verify user exists in Firebase Auth
      const userRecord = await auth.getUser(userId);
      expect(userRecord.email).toBe('firebase-test@example.com');
      expect(userRecord.displayName).toBe('Firebase Test User');

      // Verify custom claims are set
      const customClaims = userRecord.customClaims;
      expect(customClaims).toHaveProperty('role', 'candidate');

      // Verify user document exists in Firestore
      const userDoc = await firestore.collection('users').doc(userId).get();
      expect(userDoc.exists).toBe(true);
      const userData = userDoc.data();
      expect(userData?.email).toBe('firebase-test@example.com');
      expect(userData?.name).toBe('Firebase Test User');
      expect(userData?.role).toBe('candidate');
    });

    it('should create recruiter user with correct role', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'recruiter-test@example.com',
        password: 'SecurePass123!',
        name: 'Recruiter Test',
        role: 'recruiter',
      });

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe('recruiter');

      const userId = response.body.user.id;
      testUsers.push(userId);

      // Verify custom claims
      const userRecord = await auth.getUser(userId);
      expect(userRecord.customClaims?.role).toBe('recruiter');
    });

    it('should reject signup with duplicate email', async () => {
      // Create first user
      const firstResponse = await request(app).post('/api/auth/signup').send({
        email: 'duplicate-firebase@example.com',
        password: 'SecurePass123!',
        name: 'First User',
        role: 'candidate',
      });

      testUsers.push(firstResponse.body.user.id);

      // Try to create second user with same email
      const response = await request(app).post('/api/auth/signup').send({
        email: 'duplicate-firebase@example.com',
        password: 'DifferentPass456!',
        name: 'Second User',
        role: 'candidate',
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('ALREADY_EXISTS');
    });

    it('should reject signup with invalid email format', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'invalid-email-format',
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'candidate',
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject signup with missing required fields', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        // Missing name and role
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('User Signin Flow', () => {
    let testUserId: string;
    let testUserEmail: string;

    beforeEach(async () => {
      // Create a test user
      const response = await request(app).post('/api/auth/signup').send({
        email: 'signin-firebase@example.com',
        password: 'SecurePass123!',
        name: 'Signin Test User',
        role: 'candidate',
      });

      testUserId = response.body.user.id;
      testUserEmail = response.body.user.email;
      testUsers.push(testUserId);
    });

    it('should verify user exists in Firebase', async () => {
      const response = await request(app).post('/api/auth/signin').send({
        email: testUserEmail,
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUserEmail);
      expect(response.body.user.id).toBe(testUserId);
    });

    it('should reject signin with non-existent email', async () => {
      const response = await request(app).post('/api/auth/signin').send({
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject signin with missing fields', async () => {
      const response = await request(app).post('/api/auth/signin').send({
        email: testUserEmail,
        // Missing password
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Token Verification', () => {
    let testUserId: string;
    let validToken: string;

    beforeEach(async () => {
      // Create a test user
      const signupResponse = await request(app).post('/api/auth/signup').send({
        email: 'token-test@example.com',
        password: 'SecurePass123!',
        name: 'Token Test User',
        role: 'candidate',
      });

      testUserId = signupResponse.body.user.id;
      testUsers.push(testUserId);

      // Generate a valid Firebase ID token
      validToken = await auth.createCustomToken(testUserId);
    });

    it('should verify valid Firebase ID token', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.userId).toBe(testUserId);
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/test/protected');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
      expect(response.body.message).toBe('No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', 'Bearer invalid-token-12345');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should extract user information from token', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('userId', testUserId);
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('role');
    });
  });

  describe('Role-Based Access Control', () => {
    let candidateToken: string;
    let recruiterToken: string;
    let candidateUserId: string;
    let recruiterUserId: string;

    beforeEach(async () => {
      // Create candidate user
      const candidateResponse = await request(app).post('/api/auth/signup').send({
        email: 'candidate-rbac@example.com',
        password: 'SecurePass123!',
        name: 'Candidate RBAC',
        role: 'candidate',
      });

      candidateUserId = candidateResponse.body.user.id;
      testUsers.push(candidateUserId);
      candidateToken = await auth.createCustomToken(candidateUserId);

      // Create recruiter user
      const recruiterResponse = await request(app).post('/api/auth/signup').send({
        email: 'recruiter-rbac@example.com',
        password: 'SecurePass123!',
        name: 'Recruiter RBAC',
        role: 'recruiter',
      });

      recruiterUserId = recruiterResponse.body.user.id;
      testUsers.push(recruiterUserId);
      recruiterToken = await auth.createCustomToken(recruiterUserId);
    });

    it('should allow candidate to access candidate-only endpoint', async () => {
      const response = await request(app)
        .get('/api/test/candidate-only')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Candidate access granted');
    });

    it('should deny recruiter access to candidate-only endpoint', async () => {
      const response = await request(app)
        .get('/api/test/candidate-only')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    it('should allow recruiter to access recruiter-only endpoint', async () => {
      const response = await request(app)
        .get('/api/test/recruiter-only')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Recruiter access granted');
    });

    it('should deny candidate access to recruiter-only endpoint', async () => {
      const response = await request(app)
        .get('/api/test/candidate-only')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    it('should verify role is stored in custom claims', async () => {
      // Verify candidate role
      const candidateRecord = await auth.getUser(candidateUserId);
      expect(candidateRecord.customClaims?.role).toBe('candidate');

      // Verify recruiter role
      const recruiterRecord = await auth.getUser(recruiterUserId);
      expect(recruiterRecord.customClaims?.role).toBe('recruiter');
    });
  });

  describe('Set Role Endpoint', () => {
    let testUserId: string;
    let testToken: string;

    beforeEach(async () => {
      // Create a test user
      const signupResponse = await request(app).post('/api/auth/signup').send({
        email: 'setrole-test@example.com',
        password: 'SecurePass123!',
        name: 'Set Role Test',
        role: 'candidate',
      });

      testUserId = signupResponse.body.user.id;
      testUsers.push(testUserId);
      testToken = await auth.createCustomToken(testUserId);
    });

    it('should update user role in custom claims and Firestore', async () => {
      const response = await request(app)
        .post('/api/auth/set-role')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          role: 'recruiter',
        });

      expect(response.status).toBe(200);

      // Verify custom claims updated
      const userRecord = await auth.getUser(testUserId);
      expect(userRecord.customClaims?.role).toBe('recruiter');

      // Verify Firestore document updated
      const userDoc = await firestore.collection('users').doc(testUserId).get();
      expect(userDoc.data()?.role).toBe('recruiter');
    });

    it('should reject invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/set-role')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          role: 'invalid-role',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/auth/set-role').send({
        role: 'recruiter',
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Get Current User Endpoint', () => {
    let testUserId: string;
    let testToken: string;

    beforeEach(async () => {
      // Create a test user
      const signupResponse = await request(app).post('/api/auth/signup').send({
        email: 'getme-test@example.com',
        password: 'SecurePass123!',
        name: 'Get Me Test',
        role: 'candidate',
      });

      testUserId = signupResponse.body.user.id;
      testUsers.push(testUserId);
      testToken = await auth.createCustomToken(testUserId);
    });

    it('should return current user information', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(testUserId);
      expect(response.body.user.email).toBe('getme-test@example.com');
      expect(response.body.user.name).toBe('Get Me Test');
      expect(response.body.user.role).toBe('candidate');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full Firebase auth flow: signup -> verify -> set role -> get user', async () => {
      // Step 1: Signup
      const signupResponse = await request(app).post('/api/auth/signup').send({
        email: 'fullflow-test@example.com',
        password: 'SecurePass123!',
        name: 'Full Flow Test',
        role: 'candidate',
      });

      expect(signupResponse.status).toBe(201);
      const userId = signupResponse.body.user.id;
      testUsers.push(userId);

      // Step 2: Generate token and verify
      const token = await auth.createCustomToken(userId);
      const verifyResponse = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.user.userId).toBe(userId);

      // Step 3: Update role
      const setRoleResponse = await request(app)
        .post('/api/auth/set-role')
        .set('Authorization', `Bearer ${token}`)
        .send({
          role: 'recruiter',
        });

      expect(setRoleResponse.status).toBe(200);

      // Step 4: Get updated user info
      const getMeResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(getMeResponse.status).toBe(200);
      expect(getMeResponse.body.user.role).toBe('recruiter');

      // Step 5: Verify role-based access
      const recruiterAccessResponse = await request(app)
        .get('/api/test/recruiter-only')
        .set('Authorization', `Bearer ${token}`);

      expect(recruiterAccessResponse.status).toBe(200);
    });
  });
});
