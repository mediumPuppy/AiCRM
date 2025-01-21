export type CustomFieldType = 'TEXT' | 'BOOLEAN' | 'NUMBER';
export type TableName = 'contacts' | 'tickets' | 'users';

export type CustomField = {
  id: number;
  company_id: number;
  table_name: TableName;
  field_name: string;
  field_type: CustomFieldType;
  created_at: Date;
  updated_at: Date;
};

export type CustomFieldValue = {
  id: number;
  custom_field_id: number;
  record_id: number;
  value: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateCustomFieldDTO = Omit<CustomField, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCustomFieldDTO = Pick<CustomField, 'field_name' | 'field_type'>;
export type CreateCustomFieldValueDTO = Omit<CustomFieldValue, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCustomFieldValueDTO = Pick<CustomFieldValue, 'value'>; 