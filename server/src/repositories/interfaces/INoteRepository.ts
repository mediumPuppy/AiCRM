import { Note, CreateNoteDTO, UpdateNoteDTO } from '../../types/note.types';

export interface INoteRepository {
  create(data: CreateNoteDTO): Promise<Note>;
  findById(id: number): Promise<Note | null>;
  findByCompanyId(companyId: number): Promise<Note[]>;
  findByUserId(userId: number): Promise<Note[]>;
  findByTarget(targetType: Note['target_type'], targetId: number): Promise<Note[]>;
  update(id: number, data: UpdateNoteDTO): Promise<Note>;
  delete(id: number): Promise<void>;
} 