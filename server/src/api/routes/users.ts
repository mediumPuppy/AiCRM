import { Router, RequestHandler } from 'express';
import { UserRepository } from '../../repositories/implementations/UserRepository';
import { supabase } from '../../lib/supabase';
import { userReadLimiter, userWriteLimiter } from '../../middleware/rateLimiter';

const router = Router();
const userRepo = new UserRepository(supabase);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get users by company ID
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 */
const getUsers: RequestHandler = async (req, res) => {
  try {
    const companyId = Number(req.query.companyId);
    
    if (!companyId) {
      res.status(400).json({ error: 'Company ID is required' });
      return;
    }

    const users = await userRepo.findByCompanyId(companyId);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const getUserById: RequestHandler = async (req, res) => {
  try {
    const user = await userRepo.findById(Number(req.params.id));
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * @swagger
 * /api/users/email/{email}:
 *   get:
 *     summary: Get user by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 */
const getUserByEmail: RequestHandler = async (req, res) => {
  try {
    const user = await userRepo.findByEmail(req.params.email);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * @swagger
 * /api/users/team/{teamId}:
 *   get:
 *     summary: Get users by team ID
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 */
const getUsersByTeam: RequestHandler = async (req, res) => {
  try {
    const users = await userRepo.findByTeamId(Number(req.params.teamId));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - role
 *               - full_name
 *               - email
 *               - password
 *               - status
 *             properties:
 *               company_id:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [customer, agent, admin]
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended, pending]
 *               team_id:
 *                 type: integer
 *               last_login_ip:
 *                 type: string
 */
const createUser: RequestHandler = async (req, res) => {
  try {
    const user = await userRepo.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const updateUser: RequestHandler = async (req, res) => {
  try {
    const user = await userRepo.update(Number(req.params.id), req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * @swagger
 * /api/users/{id}/archive:
 *   post:
 *     summary: Archive a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const archiveUser: RequestHandler = async (req, res) => {
  try {
    await userRepo.archive(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive user' });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const deleteUser: RequestHandler = async (req, res) => {
  try {
    await userRepo.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Route definitions
router.get('/', userReadLimiter, getUsers);
router.get('/:id', userReadLimiter, getUserById);
router.get('/email/:email', userReadLimiter, getUserByEmail);
router.get('/team/:teamId', userReadLimiter, getUsersByTeam);
router.post('/', userWriteLimiter, createUser);
router.patch('/:id', userWriteLimiter, updateUser);
router.post('/:id/archive', userWriteLimiter, archiveUser);
router.delete('/:id', userWriteLimiter, deleteUser);

export default router; 