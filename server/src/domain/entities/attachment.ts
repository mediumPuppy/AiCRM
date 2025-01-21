import { Attachment } from '../../types/attachment.types';

export class AttachmentEntity implements Attachment {
  id: number;
  company_id: number;
  target_type: Attachment['target_type'];
  target_id: number;
  file_name: string;
  file_size: number;
  content_type: string;
  storage_path: string;
  created_at: Date;
  updated_at: Date;

  constructor(data: Attachment) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.target_type = data.target_type;
    this.target_id = data.target_id;
    this.file_name = data.file_name;
    this.file_size = data.file_size;
    this.content_type = data.content_type;
    this.storage_path = data.storage_path;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
} 