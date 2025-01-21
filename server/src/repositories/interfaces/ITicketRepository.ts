import { Ticket, CreateTicketDTO, UpdateTicketDTO } from '../../types/ticket.types';

export interface ITicketRepository {
  create(data: CreateTicketDTO): Promise<Ticket>;
  findById(id: number): Promise<Ticket | null>;
  findByCompanyId(companyId: number): Promise<Ticket[]>;
  findByContactId(contactId: number): Promise<Ticket[]>;
  findByAssignedUser(userId: number): Promise<Ticket[]>;
  findByStatus(companyId: number, status: Ticket['status']): Promise<Ticket[]>;
  update(id: number, data: UpdateTicketDTO): Promise<Ticket>;
  updateStatus(id: number, status: Ticket['status']): Promise<Ticket>;
  updateAssignment(id: number, userId: number | null): Promise<Ticket>;
  delete(id: number): Promise<void>;
} 