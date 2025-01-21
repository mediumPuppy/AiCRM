import { Router, RequestHandler } from 'express'
import { CompanyRepository } from '@/repositories/implementations/CompanyRepository'
import { supabase } from '@/lib/supabase'
import { adminAuthMiddleware } from '@/middleware/adminAuth'

const router = Router()
const companyRepo = new CompanyRepository(supabase)

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a new company (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               domain:
 *                 type: string
 *               settings:
 *                 type: object
 */
const createCompany: RequestHandler = async (req, res) => {
  try {
    const result = await companyRepo.create(req.body)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create company' })
  }
}

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get company details
 */
const getCompany: RequestHandler = async (req, res) => {
  try {
    const company = await companyRepo.findById(Number(req.params.id))
    if (!company) {
      res.status(404).json({ error: 'Company not found' })
    } else {
      res.json(company)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company' })
  }
}

/**
 * @swagger
 * /api/companies/{id}:
 *   patch:
 *     summary: Update company details
 */
const updateCompany: RequestHandler = async (req, res) => {
  try {
    const company = await companyRepo.update(Number(req.params.id), req.body)
    res.json(company)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update company' })
  }
}

/**
 * @swagger
 * /api/companies/{id}/settings:
 *   patch:
 *     summary: Update company settings
 */
const updateSettings: RequestHandler = async (req, res) => {
  try {
    const company = await companyRepo.updateSettings(Number(req.params.id), req.body)
    res.json(company)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update company settings' })
  }
}

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Delete a company (admin only)
 */
const deleteCompany: RequestHandler = async (req, res) => {
  try {
    await companyRepo.delete(Number(req.params.id))
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete company' })
  }
}

// Route definitions
router.post('/', adminAuthMiddleware, createCompany)
router.get('/:id', getCompany)
router.patch('/:id', updateCompany)
router.patch('/:id/settings', updateSettings)
router.delete('/:id', adminAuthMiddleware, deleteCompany)

export default router 