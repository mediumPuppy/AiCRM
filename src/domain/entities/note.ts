import { Note } from '../../types/note.types';

export class NoteEntity implements Note {
  id: number;
  company_id: number;
  user_id: number;
  target_type: Note['target_type'];
  target_id: number;
  note: string;
  created_at: Date;
  updated_at: Date;

  constructor(data: Note) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.user_id = data.user_id;
    this.target_type = data.target_type;
    this.target_id = data.target_id;
    this.note = data.note;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
} 