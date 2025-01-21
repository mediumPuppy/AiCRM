import { Router, RequestHandler } from 'express';
import { CustomFieldRepository } from '../../repositories/implementations/CustomFieldRepository';
import { supabase } from '../../lib/supabase';
import { customFieldReadLimiter, customFieldWriteLimiter } from '../../middleware/rateLimiter';
import { TableName } from '../../types/custom-field.types';

const router = Router();
const customFieldRepo = new CustomFieldRepository(supabase);

/**
 * @swagger
 * /api/custom-fields:
 *   post:
 *     summary: Create a new custom field
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_id:
 *                 type: integer
 *               table_name:
 *                 type: string
 *                 enum: [contacts, tickets, users]
 *               field_name:
 *                 type: string
 *               field_type:
 *                 type: string
 *                 enum: [TEXT, BOOLEAN, NUMBER]
 */
const createCustomField: RequestHandler = async (req, res) => {
  try {
    const field = await customFieldRepo.create(req.body);
    res.status(201).json(field);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create custom field' });
  }
};

/**
 * @swagger
 * /api/custom-fields/{id}:
 *   get:
 *     summary: Get custom field by ID
 */
const getCustomFieldById: RequestHandler = async (req, res) => {
  try {
    const field = await customFieldRepo.findById(Number(req.params.id));
    if (!field) {
      res.status(404).json({ error: 'Custom field not found' });
    } else {
      res.json(field);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch custom field' });
  }
};

/**
 * @swagger
 * /api/custom-fields/company/{companyId}:
 *   get:
 *     summary: Get all custom fields for a company
 */
const getCustomFieldsByCompany: RequestHandler = async (req, res) => {
  try {
    const fields = await customFieldRepo.findByCompanyId(Number(req.params.companyId));
    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company custom fields' });
  }
};

/**
 * @swagger
 * /api/custom-fields/company/{companyId}/table/{tableName}:
 *   get:
 *     summary: Get custom fields for a specific table in a company
 */
const getCustomFieldsByTable: RequestHandler = async (req, res) => {
  try {
    const fields = await customFieldRepo.findByTableName(
      Number(req.params.companyId),
      req.params.tableName as TableName
    );
    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch table custom fields' });
  }
};

/**
 * @swagger
 * /api/custom-fields/{id}:
 *   patch:
 *     summary: Update custom field
 */
const updateCustomField: RequestHandler = async (req, res) => {
  try {
    const field = await customFieldRepo.update(Number(req.params.id), req.body);
    res.json(field);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update custom field' });
  }
};

/**
 * @swagger
 * /api/custom-fields/{id}:
 *   delete:
 *     summary: Delete custom field and its values
 */
const deleteCustomField: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await customFieldRepo.deleteValuesByFieldId(id);
    await customFieldRepo.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
};

// Custom Field Values endpoints

/**
 * @swagger
 * /api/custom-fields/{fieldId}/values:
 *   post:
 *     summary: Create a new custom field value
 */
const createCustomFieldValue: RequestHandler = async (req, res) => {
  try {
    const value = await customFieldRepo.createValue({
      ...req.body,
      custom_field_id: Number(req.params.fieldId)
    });
    res.status(201).json(value);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create custom field value' });
  }
};

/**
 * @swagger
 * /api/custom-fields/{fieldId}/values/{valueId}:
 *   get:
 *     summary: Get custom field value by ID
 */
const getCustomFieldValue: RequestHandler = async (req, res) => {
  try {
    const value = await customFieldRepo.findValueById(Number(req.params.valueId));
    if (!value) {
      res.status(404).json({ error: 'Custom field value not found' });
    } else {
      res.json(value);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch custom field value' });
  }
};

/**
 * @swagger
 * /api/custom-fields/{fieldId}/values:
 *   get:
 *     summary: Get all values for a custom field
 */
const getCustomFieldValues: RequestHandler = async (req, res) => {
  try {
    const values = await customFieldRepo.findValuesByFieldId(Number(req.params.fieldId));
    res.json(values);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch custom field values' });
  }
};

/**
 * @swagger
 * /api/custom-fields/{fieldId}/values/record/{recordId}:
 *   get:
 *     summary: Get custom field values for a specific record
 */
const getCustomFieldValuesByRecord: RequestHandler = async (req, res) => {
  try {
    const values = await customFieldRepo.findValuesByRecordId(
      Number(req.params.fieldId),
      Number(req.params.recordId)
    );
    res.json(values);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch record custom field values' });
  }
};

/**
 * @swagger
 * /api/custom-fields/{fieldId}/values/{valueId}:
 *   patch:
 *     summary: Update custom field value
 */
const updateCustomFieldValue: RequestHandler = async (req, res) => {
  try {
    const value = await customFieldRepo.updateValue(Number(req.params.valueId), req.body);
    res.json(value);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update custom field value' });
  }
};

/**
 * @swagger
 * /api/custom-fields/{fieldId}/values/{valueId}:
 *   delete:
 *     summary: Delete custom field value
 */
const deleteCustomFieldValue: RequestHandler = async (req, res) => {
  try {
    await customFieldRepo.deleteValue(Number(req.params.valueId));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete custom field value' });
  }
};

// Route definitions with rate limiting
router.post('/', customFieldWriteLimiter, createCustomField);
router.get('/:id', customFieldReadLimiter, getCustomFieldById);
router.get('/company/:companyId', customFieldReadLimiter, getCustomFieldsByCompany);
router.get('/company/:companyId/table/:tableName', customFieldReadLimiter, getCustomFieldsByTable);
router.patch('/:id', customFieldWriteLimiter, updateCustomField);
router.delete('/:id', customFieldWriteLimiter, deleteCustomField);

// Custom Field Values routes
router.post('/:fieldId/values', customFieldWriteLimiter, createCustomFieldValue);
router.get('/:fieldId/values/:valueId', customFieldReadLimiter, getCustomFieldValue);
router.get('/:fieldId/values', customFieldReadLimiter, getCustomFieldValues);
router.get('/:fieldId/values/record/:recordId', customFieldReadLimiter, getCustomFieldValuesByRecord);
router.patch('/:fieldId/values/:valueId', customFieldWriteLimiter, updateCustomFieldValue);
router.delete('/:fieldId/values/:valueId', customFieldWriteLimiter, deleteCustomFieldValue);

export default router; 