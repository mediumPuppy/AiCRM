import request from 'supertest';
import app from '../../index';
import { CustomFieldRepository } from '@/repositories/implementations/CustomFieldRepository';

// Mock functions need to be declared inside the mock
jest.mock('@/repositories/implementations/CustomFieldRepository', () => {
  const mockCreate = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByCompanyId = jest.fn();
  const mockFindByTableName = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockCreateValue = jest.fn();
  const mockFindValueById = jest.fn();
  const mockFindValuesByFieldId = jest.fn();
  const mockFindValuesByRecordId = jest.fn();
  const mockUpdateValue = jest.fn();
  const mockDeleteValue = jest.fn();
  const mockDeleteValuesByFieldId = jest.fn();
  
  return {
    CustomFieldRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: mockFindById,
      findByCompanyId: mockFindByCompanyId,
      findByTableName: mockFindByTableName,
      update: mockUpdate,
      delete: mockDelete,
      createValue: mockCreateValue,
      findValueById: mockFindValueById,
      findValuesByFieldId: mockFindValuesByFieldId,
      findValuesByRecordId: mockFindValuesByRecordId,
      updateValue: mockUpdateValue,
      deleteValue: mockDeleteValue,
      deleteValuesByFieldId: mockDeleteValuesByFieldId,
    }))
  };
});

describe('Custom Field Routes', () => {
  let mockCreate: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByCompanyId: jest.Mock;
  let mockFindByTableName: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockCreateValue: jest.Mock;
  let mockFindValueById: jest.Mock;
  let mockFindValuesByFieldId: jest.Mock;
  let mockFindValuesByRecordId: jest.Mock;
  let mockUpdateValue: jest.Mock;
  let mockDeleteValue: jest.Mock;
  let mockDeleteValuesByFieldId: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new CustomFieldRepository({} as any);
    mockCreate = mockRepo.create as jest.Mock;
    mockFindById = mockRepo.findById as jest.Mock;
    mockFindByCompanyId = mockRepo.findByCompanyId as jest.Mock;
    mockFindByTableName = mockRepo.findByTableName as jest.Mock;
    mockUpdate = mockRepo.update as jest.Mock;
    mockDelete = mockRepo.delete as jest.Mock;
    mockCreateValue = mockRepo.createValue as jest.Mock;
    mockFindValueById = mockRepo.findValueById as jest.Mock;
    mockFindValuesByFieldId = mockRepo.findValuesByFieldId as jest.Mock;
    mockFindValuesByRecordId = mockRepo.findValuesByRecordId as jest.Mock;
    mockUpdateValue = mockRepo.updateValue as jest.Mock;
    mockDeleteValue = mockRepo.deleteValue as jest.Mock;
    mockDeleteValuesByFieldId = mockRepo.deleteValuesByFieldId as jest.Mock;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  const mockCustomField = {
    id: 1,
    company_id: 1,
    table_name: 'contacts' as const,
    field_name: 'Test Field',
    field_type: 'TEXT' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockCustomFieldValue = {
    id: 1,
    custom_field_id: 1,
    record_id: 1,
    value: 'Test Value',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  describe('POST /api/custom-fields', () => {
    it('should create new custom field', async () => {
      mockCreate.mockResolvedValue(mockCustomField);

      const response = await request(app)
        .post('/api/custom-fields')
        .send({
          company_id: 1,
          table_name: 'contacts',
          field_name: 'Test Field',
          field_type: 'TEXT'
        })
        .expect(201);

      expect(response.body).toEqual(mockCustomField);
      expect(mockCreate).toHaveBeenCalledWith({
        company_id: 1,
        table_name: 'contacts',
        field_name: 'Test Field',
        field_type: 'TEXT'
      });
    });

    it('should return 500 when creation fails', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/custom-fields')
        .send({
          company_id: 1,
          table_name: 'contacts',
          field_name: 'Test Field',
          field_type: 'TEXT'
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create custom field' });
    });
  });

  describe('GET /api/custom-fields/:id', () => {
    it('should return custom field by id', async () => {
      mockFindById.mockResolvedValue(mockCustomField);

      const response = await request(app)
        .get('/api/custom-fields/1')
        .expect(200);

      expect(response.body).toEqual(mockCustomField);
    });

    it('should return 404 when custom field not found', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/custom-fields/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Custom field not found' });
    });
  });

  describe('GET /api/custom-fields/company/:companyId', () => {
    it('should return company custom fields', async () => {
      const mockFields = [mockCustomField];
      mockFindByCompanyId.mockResolvedValue(mockFields);

      const response = await request(app)
        .get('/api/custom-fields/company/1')
        .expect(200);

      expect(response.body).toEqual(mockFields);
    });
  });

  describe('GET /api/custom-fields/company/:companyId/table/:tableName', () => {
    it('should return table custom fields', async () => {
      const mockFields = [mockCustomField];
      mockFindByTableName.mockResolvedValue(mockFields);

      const response = await request(app)
        .get('/api/custom-fields/company/1/table/contacts')
        .expect(200);

      expect(response.body).toEqual(mockFields);
    });
  });

  describe('PATCH /api/custom-fields/:id', () => {
    it('should update custom field', async () => {
      const updatedField = { ...mockCustomField, field_name: 'Updated Field' };
      mockUpdate.mockResolvedValue(updatedField);

      const response = await request(app)
        .patch('/api/custom-fields/1')
        .send({ field_name: 'Updated Field' })
        .expect(200);

      expect(response.body).toEqual(updatedField);
    });
  });

  describe('DELETE /api/custom-fields/:id', () => {
    it('should delete custom field and its values', async () => {
      mockDeleteValuesByFieldId.mockResolvedValue(undefined);
      mockDelete.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/custom-fields/1')
        .expect(204);

      expect(mockDeleteValuesByFieldId).toHaveBeenCalledWith(1);
      expect(mockDelete).toHaveBeenCalledWith(1);
    });
  });

  // Custom Field Values Tests

  describe('POST /api/custom-fields/:fieldId/values', () => {
    it('should create new custom field value', async () => {
      mockCreateValue.mockResolvedValue(mockCustomFieldValue);

      const response = await request(app)
        .post('/api/custom-fields/1/values')
        .send({
          record_id: 1,
          value: 'Test Value'
        })
        .expect(201);

      expect(response.body).toEqual(mockCustomFieldValue);
      expect(mockCreateValue).toHaveBeenCalledWith({
        custom_field_id: 1,
        record_id: 1,
        value: 'Test Value'
      });
    });
  });

  describe('GET /api/custom-fields/:fieldId/values/:valueId', () => {
    it('should return custom field value', async () => {
      mockFindValueById.mockResolvedValue(mockCustomFieldValue);

      const response = await request(app)
        .get('/api/custom-fields/1/values/1')
        .expect(200);

      expect(response.body).toEqual(mockCustomFieldValue);
    });

    it('should return 404 when value not found', async () => {
      mockFindValueById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/custom-fields/1/values/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Custom field value not found' });
    });
  });

  describe('GET /api/custom-fields/:fieldId/values', () => {
    it('should return all values for a custom field', async () => {
      const mockValues = [mockCustomFieldValue];
      mockFindValuesByFieldId.mockResolvedValue(mockValues);

      const response = await request(app)
        .get('/api/custom-fields/1/values')
        .expect(200);

      expect(response.body).toEqual(mockValues);
    });
  });

  describe('GET /api/custom-fields/:fieldId/values/record/:recordId', () => {
    it('should return values for a specific record', async () => {
      const mockValues = [mockCustomFieldValue];
      mockFindValuesByRecordId.mockResolvedValue(mockValues);

      const response = await request(app)
        .get('/api/custom-fields/1/values/record/1')
        .expect(200);

      expect(response.body).toEqual(mockValues);
    });
  });

  describe('PATCH /api/custom-fields/:fieldId/values/:valueId', () => {
    it('should update custom field value', async () => {
      const updatedValue = { ...mockCustomFieldValue, value: 'Updated Value' };
      mockUpdateValue.mockResolvedValue(updatedValue);

      const response = await request(app)
        .patch('/api/custom-fields/1/values/1')
        .send({ value: 'Updated Value' })
        .expect(200);

      expect(response.body).toEqual(updatedValue);
    });
  });

  describe('DELETE /api/custom-fields/:fieldId/values/:valueId', () => {
    it('should delete custom field value', async () => {
      mockDeleteValue.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/custom-fields/1/values/1')
        .expect(204);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting for read operations', async () => {
      const requests = Array(10001).fill(null); // Just over the 10000 limit
      let limitHit = false;
      let successCount = 0;
      
      for (const _ of requests) {
        const response = await request(app)
          .get('/api/custom-fields/1');
        
        if (response.status === 429) {
          limitHit = true;
          expect(response.body).toEqual({
            error: 'Too many custom field read attempts, please try again later'
          });
          break;
        } else if (response.status === 200) {
          successCount++;
        }
      }
      
      expect(limitHit).toBe(true);
      expect(successCount).toBeLessThanOrEqual(10000);
    }, 75000); // 75 seconds

    it('should handle rate limiting for write operations', async () => {
      const requests = Array(1001).fill(null); // Just over the 1000 limit
      let limitHit = false;
      let successCount = 0;
      
      for (const _ of requests) {
        const response = await request(app)
          .post('/api/custom-fields')
          .send({
            company_id: 1,
            table_name: 'contacts',
            field_name: 'Test Field',
            field_type: 'TEXT'
          });
        
        if (response.status === 429) {
          limitHit = true;
          expect(response.body).toEqual({
            error: 'Too many custom field write attempts, please try again later'
          });
          break;
        } else if (response.status === 201) {
          successCount++;
        }
      }
      
      expect(limitHit).toBe(true);
      expect(successCount).toBeLessThanOrEqual(1000);
    }, 75000); // 75 seconds
  });
}); 