import { Tag, Taggable } from '../../types/tag.types';

export class TagEntity implements Tag {
  id: number;
  company_id: number;
  name: string;
  color: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(data: Tag) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.name = data.name;
    this.color = data.color;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
}

export class TaggableEntity implements Taggable {
  tag_id: number;
  entity_type: Taggable['entity_type'];
  entity_id: number;
  created_at: Date;

  constructor(data: Taggable) {
    this.tag_id = data.tag_id;
    this.entity_type = data.entity_type;
    this.entity_id = data.entity_id;
    this.created_at = new Date(data.created_at);
  }
} 