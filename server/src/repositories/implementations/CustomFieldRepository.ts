import { SupabaseClient } from '@supabase/supabase-js';
import { ICustomFieldRepository } from '../interfaces/ICustomFieldRepository';
import { 
  CustomField, 
  CustomFieldValue, 
  CreateCustomFieldDTO, 
  UpdateCustomFieldDTO,
  CreateCustomFieldValueDTO,
  UpdateCustomFieldValueDTO,
  TableName
} from '../../types/custom-field.types';
import { CustomFieldEntity, CustomFieldValueEntity } from '../../domain/entities/custom-field';

export class CustomFieldRepository implements ICustomFieldRepository {
  private readonly fieldsTable = 'custom_fields';
  private readonly valuesTable = 'custom_field_values';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateCustomFieldDTO): Promise<CustomField> {
    const { data: field, error } = await this.supabase
      .from(this.fieldsTable)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new CustomFieldEntity(field);
  }

  async findById(id: number): Promise<CustomField | null> {
    const { data: field, error } = await this.supabase
      .from(this.fieldsTable)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return field ? new CustomFieldEntity(field) : null;
  }

  async findByCompanyId(companyId: number): Promise<CustomField[]> {
    const { data: fields, error } = await this.supabase
      .from(this.fieldsTable)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return fields.map(field => new CustomFieldEntity(field));
  }

  async findByTableName(companyId: number, tableName: TableName): Promise<CustomField[]> {
    const { data: fields, error } = await this.supabase
      .from(this.fieldsTable)
      .select()
      .eq('company_id', companyId)
      .eq('table_name', tableName);

    if (error) throw error;
    return fields.map(field => new CustomFieldEntity(field));
  }

  async update(id: number, data: UpdateCustomFieldDTO): Promise<CustomField> {
    const { data: field, error } = await this.supabase
      .from(this.fieldsTable)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new CustomFieldEntity(field);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.fieldsTable)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Custom Field Values methods
  async createValue(data: CreateCustomFieldValueDTO): Promise<CustomFieldValue> {
    const { data: value, error } = await this.supabase
      .from(this.valuesTable)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new CustomFieldValueEntity(value);
  }

  async findValueById(id: number): Promise<CustomFieldValue | null> {
    const { data: value, error } = await this.supabase
      .from(this.valuesTable)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return value ? new CustomFieldValueEntity(value) : null;
  }

  async findValuesByFieldId(fieldId: number): Promise<CustomFieldValue[]> {
    const { data: values, error } = await this.supabase
      .from(this.valuesTable)
      .select()
      .eq('custom_field_id', fieldId);

    if (error) throw error;
    return values.map(value => new CustomFieldValueEntity(value));
  }

  async findValuesByRecordId(fieldId: number, recordId: number): Promise<CustomFieldValue[]> {
    const { data: values, error } = await this.supabase
      .from(this.valuesTable)
      .select()
      .eq('custom_field_id', fieldId)
      .eq('record_id', recordId);

    if (error) throw error;
    return values.map(value => new CustomFieldValueEntity(value));
  }

  async updateValue(id: number, data: UpdateCustomFieldValueDTO): Promise<CustomFieldValue> {
    const { data: value, error } = await this.supabase
      .from(this.valuesTable)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new CustomFieldValueEntity(value);
  }

  async deleteValue(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.valuesTable)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteValuesByFieldId(fieldId: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.valuesTable)
      .delete()
      .eq('custom_field_id', fieldId);

    if (error) throw error;
  }
} 