import { Router, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../repositories/implementations/UserRepository';
import { supabase } from '../../lib/supabase';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { UserStatus, UserRole } from '../../types/user.types';

const router = Router();
const userRepo = new UserRepository(supabase);

// JWT secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

/**
 * @swagger
 * /admin/signup:
 *   post:
 *     summary: Create a new admin user
 */
const adminSignup: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { full_name, email, password } = req.body;
    // Validate required fields
    if (!full_name || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if user already exists
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const userData = {
      company_id: 1,
      role: 'admin' as UserRole,
      full_name,
      email,
      password: hashedPassword,
      status: 'active' as UserStatus,
      team_id: null,
      last_login_ip: req.ip || null
    };

    const user = await userRepo.create(userData);

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: 'admin',
        companyId: user.company_id 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data and token (excluding password)
    const { password: _, ...userDataWithoutPassword } = user;
    res.status(201).json({ user: userDataWithoutPassword, token });

  } catch (error: any) {
    console.error('Detailed signup error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
};

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Authenticate an admin user
 */
const adminLogin: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    // Find user by email
    const user = await userRepo.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized: Admin access required' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: 'admin',
        companyId: user.company_id 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login IP
    await userRepo.update(user.id, { last_login_ip: req.ip });

    // Return user data and token (excluding password)
    const { password: _, ...userData } = user;
    res.json({ user: userData, token });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Apply rate limiting to auth routes
router.post('/admin/signup', authRateLimiter, adminSignup);
router.post('/admin/login', authRateLimiter, adminLogin);

export default router; 