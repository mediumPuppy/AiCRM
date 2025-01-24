import { Router, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ContactRepository } from '../../repositories/implementations/ContactRepository';
import { supabase } from '../../lib/supabase';
import { authRateLimiter } from '../../middleware/rateLimiter';

const router = Router();
const contactRepo = new ContactRepository(supabase);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

/**
 * @swagger
 * /client/signup:
 *   post:
 *     summary: Create a new customer account
 */
const clientSignup: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { full_name, email, password, phone } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if contact already exists
    const existingContact = await contactRepo.findByEmail(email);
    if (existingContact) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create contact with hardcoded company_id
    const contact = await contactRepo.create({
      company_id: 1, // Hardcoded as specified
      full_name,
      email,
      phone,
      portal_enabled: true,
      portal_email: email,
      portal_username: email,
      portal_password: hashedPassword,
      status: 'active',
      metadata: {
        signup_ip: req.ip,
        signup_date: new Date().toISOString()
      }
    });

    // Generate JWT
    const token = jwt.sign(
      {
        contactId: contact.id,
        role: 'customer',
        companyId: contact.company_id
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Longer expiry for customers
    );

    // Return contact data and token (excluding password)
    const { portal_password: _, ...contactData } = contact;
    res.status(201).json({ contact: contactData, token });

  } catch (error) {
    console.error('Client signup error:', error);
    res.status(500).json({ error: 'Failed to create customer account' });
  }
};

/**
 * @swagger
 * /client/login:
 *   post:
 *     summary: Authenticate a customer
 */
const clientLogin: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    // Find contact by email
    const contact = await contactRepo.findByEmail(email);
    if (!contact || !contact.portal_enabled) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    if (!contact.portal_password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const isValidPassword = await bcrypt.compare(password, contact.portal_password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        contactId: contact.id,
        role: 'customer',
        companyId: contact.company_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login timestamp
    await contactRepo.update(contact.id, {
      metadata: {
        ...contact.metadata,
        last_login_at: new Date().toISOString(),
        last_login_ip: req.ip
      }
    });

    // Return contact data and token (excluding password)
    const { portal_password: _, ...contactData } = contact;
    res.json({ contact: contactData, token });

  } catch (error) {
    console.error('Client login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Apply rate limiting to auth routes
router.post('/client/signup', authRateLimiter, clientSignup);
router.post('/client/login', authRateLimiter, clientLogin);

export default router; 