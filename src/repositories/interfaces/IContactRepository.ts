import { Contact, CreateContactDTO, UpdateContactDTO } from '../../types/contact.types';

export interface IContactRepository {
  create(data: CreateContactDTO): Promise<Contact>;
  findById(id: number): Promise<Contact | null>;
  findByEmail(email: string): Promise<Contact | null>;
  findByCompanyId(companyId: number): Promise<Contact[]>;
  update(id: number, data: UpdateContactDTO): Promise<Contact>;
  archive(id: number): Promise<void>;
  enablePortal(id: number, portalData: { email: string; username: string; password: string }): Promise<Contact>;
  disablePortal(id: number): Promise<Contact>;
  delete(id: number): Promise<void>;
} 