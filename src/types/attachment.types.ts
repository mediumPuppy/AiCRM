export type AttachmentTargetType = 'ticket' | 'note' | 'article' | 'chat_message';

export type Attachment = {
  id: number;
  company_id: number;
  target_type: AttachmentTargetType;
  target_id: number;
  file_name: string;
  file_size: number;
  content_type: string;
  storage_path: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateAttachmentDTO = Omit<Attachment, 'id' | 'created_at' | 'updated_at'>;
export type UpdateAttachmentDTO = Pick<Attachment, 'file_name' | 'content_type'>; 