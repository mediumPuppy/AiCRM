import { Attachment, CreateAttachmentDTO, UpdateAttachmentDTO } from '../../types/attachment.types';

export interface IAttachmentRepository {
  create(data: CreateAttachmentDTO): Promise<Attachment>;
  findById(id: number): Promise<Attachment | null>;
  findByCompanyId(companyId: number): Promise<Attachment[]>;
  findByTarget(targetType: Attachment['target_type'], targetId: number): Promise<Attachment[]>;
  update(id: number, data: UpdateAttachmentDTO): Promise<Attachment>;
  delete(id: number): Promise<void>;
  deleteByTarget(targetType: Attachment['target_type'], targetId: number): Promise<void>;
} 