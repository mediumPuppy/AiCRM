export type TargetType = 'ticket' | 'contact';

export type Note = {
  id: number;
  company_id: number;
  user_id: number;
  target_type: TargetType;
  target_id: number;
  note: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateNoteDTO = Omit<Note, 'id' | 'created_at' | 'updated_at'>;
export type UpdateNoteDTO = Pick<Note, 'note'>; 