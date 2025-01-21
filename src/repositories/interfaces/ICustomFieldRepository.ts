import { 
  CustomField, 
  CustomFieldValue, 
  CreateCustomFieldDTO, 
  UpdateCustomFieldDTO,
  CreateCustomFieldValueDTO,
  UpdateCustomFieldValueDTO,
  TableName
} from '../../types/custom-field.types';

export interface ICustomFieldRepository {
  create(data: CreateCustomFieldDTO): Promise<CustomField>;
  findById(id: number): Promise<CustomField | null>;
  findByCompanyId(companyId: number): Promise<CustomField[]>;
  findByTableName(companyId: number, tableName: TableName): Promise<CustomField[]>;
  update(id: number, data: UpdateCustomFieldDTO): Promise<CustomField>;
  delete(id: number): Promise<void>;
  
  // Custom Field Values
  createValue(data: CreateCustomFieldValueDTO): Promise<CustomFieldValue>;
  findValueById(id: number): Promise<CustomFieldValue | null>;
  findValuesByFieldId(fieldId: number): Promise<CustomFieldValue[]>;
  findValuesByRecordId(fieldId: number, recordId: number): Promise<CustomFieldValue[]>;
  updateValue(id: number, data: UpdateCustomFieldValueDTO): Promise<CustomFieldValue>;
  deleteValue(id: number): Promise<void>;
  deleteValuesByFieldId(fieldId: number): Promise<void>;
} 