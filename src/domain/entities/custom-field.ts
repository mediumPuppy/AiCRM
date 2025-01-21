import { CustomField, CustomFieldValue } from '../../types/custom-field.types';

export class CustomFieldEntity implements CustomField {
  id: number;
  company_id: number;
  table_name: CustomField['table_name'];
  field_name: string;
  field_type: CustomField['field_type'];
  created_at: Date;
  updated_at: Date;

  constructor(data: CustomField) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.table_name = data.table_name;
    this.field_name = data.field_name;
    this.field_type = data.field_type;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
}

export class CustomFieldValueEntity implements CustomFieldValue {
  id: number;
  custom_field_id: number;
  record_id: number;
  value: string;
  created_at: Date;
  updated_at: Date;

  constructor(data: CustomFieldValue) {
    this.id = data.id;
    this.custom_field_id = data.custom_field_id;
    this.record_id = data.record_id;
    this.value = data.value;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
} 