import { Company, CreateCompanyDTO, UpdateCompanyDTO } from '@/types/company.types';

export interface ICompanyRepository {
  create(data: CreateCompanyDTO): Promise<Company>;
  findById(id: number): Promise<Company | null>;
  findAll(): Promise<Company[]>;
  update(id: number, data: UpdateCompanyDTO): Promise<Company>;
  delete(id: number): Promise<void>;
  updateSettings(id: number, settings: Record<string, any>): Promise<Company>;
}