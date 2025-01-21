import { PortalSession, CreatePortalSessionDTO, UpdatePortalSessionDTO } from '../../types/portal-session.types';

export interface IPortalSessionRepository {
  create(data: CreatePortalSessionDTO): Promise<PortalSession>;
  findById(id: number): Promise<PortalSession | null>;
  findByToken(token: string): Promise<PortalSession | null>;
  findByContactId(contactId: number): Promise<PortalSession[]>;
  findActiveByContactId(contactId: number): Promise<PortalSession[]>;
  updateLastAccessed(id: number): Promise<PortalSession>;
  delete(id: number): Promise<void>;
  deleteExpired(): Promise<void>;
  update(id: number, data: UpdatePortalSessionDTO): Promise<PortalSession>;
} 