import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { validateSignupData, validateSigninData } from '../utils/validation';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Rate limiter: 5 attempts per 15 minutes
const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
});

/**
 * POST /api/auth/signup
 * Create a new user account
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

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({
        code: 'ALREADY_EXISTS',
        message: 'Email already registered',
      });
      return;
    }

    // Create user
    const user = await UserModel.create({
      email,
      password,
      name,
      role,
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data (without password hash) and tokens
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create account',
    });
  }
});

/**
 * POST /api/auth/signin
 * Authenticate user and return tokens
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

    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    // Verify password
    const isValidPassword = await UserModel.comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data (without password hash) and tokens
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to sign in',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Verify user still exists
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      });
      return;
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to refresh token',
    });
  }
});

export default router;
