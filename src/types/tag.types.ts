export type EntityType = 'contact' | 'ticket';

export type Tag = {
  id: number;
  company_id: number;
  name: string;
  color: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Taggable = {
  tag_id: number;
  entity_type: EntityType;
  entity_id: number;
  created_at: Date;
};

export type CreateTagDTO = Omit<Tag, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTagDTO = Pick<Tag, 'name' | 'color'>;
export type CreateTaggableDTO = Omit<Taggable, 'created_at'>; 