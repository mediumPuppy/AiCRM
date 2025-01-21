import { Router, RequestHandler } from 'express';
import { TeamRepository } from '../../repositories/implementations/TeamRepository';
import { supabase } from '../../lib/supabase';
import { teamReadLimiter, teamWriteLimiter } from '../../middleware/rateLimiter';

const router = Router();
const teamRepo = new TeamRepository(supabase);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 */
const createTeam: RequestHandler = async (req, res) => {
  try {
    const team = await teamRepo.create(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team' });
  }
};

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get team by ID
 */
const getTeamById: RequestHandler = async (req, res) => {
  try {
    const team = await teamRepo.findById(Number(req.params.id));
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
    } else {
      res.json(team);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};

/**
 * @swagger
 * /api/teams/company/{companyId}:
 *   get:
 *     summary: Get all teams for a company
 */
const getTeamsByCompanyId: RequestHandler = async (req, res) => {
  try {
    const teams = await teamRepo.findByCompanyId(Number(req.params.companyId));
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company teams' });
  }
};

/**
 * @swagger
 * /api/teams/{id}:
 *   patch:
 *     summary: Update a team
 */
const updateTeam: RequestHandler = async (req, res) => {
  try {
    const team = await teamRepo.update(Number(req.params.id), req.body);
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team' });
  }
};

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a team
 */
const deleteTeam: RequestHandler = async (req, res) => {
  try {
    await teamRepo.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
};

// Route definitions
router.post('/', teamWriteLimiter, createTeam);
router.get('/:id', teamReadLimiter, getTeamById);
router.get('/company/:companyId', teamReadLimiter, getTeamsByCompanyId);
router.patch('/:id', teamWriteLimiter, updateTeam);
router.delete('/:id', teamWriteLimiter, deleteTeam);

export default router; 