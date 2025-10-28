import { Router, Request, Response } from 'express';
import { auth, firestore } from '../config/firebase';
import { validateSignupData, validateSigninData } from '../utils/validation';
import { rateLimiter } from '../middleware/rateLimiter';
import { authenticateFirebase, AuthRequest } from '../middleware/firebaseAuth';
import { Timestamp } from 'firebase-admin/firestore';

const router = Router();

// Note: JWT-based authentication has been fully replaced with Firebase Authentication
// All endpoints now use Firebase ID tokens for authentication

// Rate limiter: 5 attempts per 15 minutes
const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
});

/**
 * POST /api/auth/signup
 * Create a new user account with Firebase Authentication
 */
router.post('/signup', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validationErrors = validateSignupData(req.body);
    if (validationErrors.length > 0) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        errors: validationErrors,
      });
      return;
    }

    const { email, password, name, role } = req.body;

    // Check if email already exists in Firebase Auth
    try {
      await auth.getUserByEmail(email);
      res.status(400).json({
        code: 'ALREADY_EXISTS',
        message: 'Email already registered',
      });
      return;
    } catch (error: any) {
      // User doesn't exist, continue with creation
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Set custom claims for role
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // Create Firestore user document
    const userDoc = {
      email,
      name,
      role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await firestore.collection('users').doc(userRecord.uid).set(userDoc);

    // Return user data (Firebase handles tokens on client side)
    res.status(201).json({
      user: {
        id: userRecord.uid,
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
        createdAt: userDoc.createdAt.toDate(),
      },
      message: 'Account created successfully. Please sign in to continue.',
    });
  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle Firebase-specific errors
    if (error.code === 'auth/email-already-exists') {
      res.status(400).json({
        code: 'ALREADY_EXISTS',
        message: 'Email already registered',
      });
      return;
    }

    if (error.code === 'auth/invalid-email') {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid email format',
      });
      return;
    }

    if (error.code === 'auth/weak-password') {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Password is too weak',
      });
      return;
    }

    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create account',
    });
  }
});

/**
 * POST /api/auth/signin
 * Authenticate user with Firebase (verification happens on client side)
 * This endpoint is kept for compatibility but authentication is handled by Firebase client SDK
 */
router.post('/signin', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validationErrors = validateSigninData(req.body);
    if (validationErrors.length > 0) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        errors: validationErrors,
      });
      return;
    }

    const { email } = req.body;

    // Verify user exists in Firebase Auth
    try {
      const userRecord = await auth.getUserByEmail(email);

      // Get user data from Firestore
      const userDoc = await firestore.collection('users').doc(userRecord.uid).get();

      if (!userDoc.exists) {
        res.status(401).json({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
        return;
      }

      const userData = userDoc.data()!;

      // Return user data (client will handle Firebase authentication)
      res.status(200).json({
        user: {
          id: userRecord.uid,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatarUrl: userData.avatarUrl,
          createdAt: userData.createdAt.toDate(),
        },
        message: 'User verified. Complete authentication on client side.',
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        res.status(401).json({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to sign in',
    });
  }
});

/**
 * POST /api/auth/google-signup
 * Create user profile for Google sign-in (requires authentication)
 */
router.post(
  '/google-signup',
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid, email, name, avatarUrl, role } = req.body;
      const userId = req.user!.userId;

      // Verify the authenticated user matches the request
      if (userId !== uid) {
        res.status(403).json({
          code: 'FORBIDDEN',
          message: 'User ID mismatch',
        });
        return;
      }

      // Check if user already exists
      const userDoc = await firestore.collection('users').doc(userId).get();
      if (userDoc.exists) {
        res.status(200).json({
          message: 'User already exists',
          user: userDoc.data(),
        });
        return;
      }

      // Create Firestore user document
      const userData = {
        email: email || '',
        name: name || 'User',
        role: role || 'candidate',
        avatarUrl: avatarUrl || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await firestore.collection('users').doc(userId).set(userData);

      // Set custom claims for role
      await auth.setCustomUserClaims(userId, { role: userData.role });

      res.status(201).json({
        message: 'User profile created successfully',
        user: {
          id: userId,
          ...userData,
          createdAt: userData.createdAt.toDate(),
          updatedAt: userData.updatedAt.toDate(),
        },
      });
    } catch (error) {
      console.error('Google signup error:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user profile',
      });
    }
  }
);

/**
 * POST /api/auth/set-role
 * Set custom claims for user role (requires authentication)
 */
router.post(
  '/set-role',
  authenticateFirebase,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { role } = req.body;
      const userId = req.user!.userId;

      if (!role || !['candidate', 'recruiter', 'admin'].includes(role)) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid role',
        });
        return;
      }

      // Set custom claims
      await auth.setCustomUserClaims(userId, { role });

      // Update Firestore document
      await firestore.collection('users').doc(userId).update({
        role,
        updatedAt: Timestamp.now(),
      });

      res.status(200).json({
        message: 'Role updated successfully',
      });
    } catch (error) {
      console.error('Set role error:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to set role',
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user information (requires authentication)
 */
router.get('/me', authenticateFirebase, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get user data from Firestore
    const userDoc = await firestore.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
      return;
    }

    const userData = userDoc.data()!;

    res.status(200).json({
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatarUrl: userData.avatarUrl,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate(),
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to get user information',
    });
  }
});

export default router;
