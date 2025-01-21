import { Tag, Taggable, CreateTagDTO, UpdateTagDTO, CreateTaggableDTO, EntityType } from '../../types/tag.types';

export interface ITagRepository {
  create(data: CreateTagDTO): Promise<Tag>;
  findById(id: number): Promise<Tag | null>;
  findByCompanyId(companyId: number): Promise<Tag[]>;
  update(id: number, data: UpdateTagDTO): Promise<Tag>;
  delete(id: number): Promise<void>;

  // Taggable operations
  addTagToEntity(data: CreateTaggableDTO): Promise<Taggable>;
  removeTagFromEntity(tagId: number, entityType: EntityType, entityId: number): Promise<void>;
  findTagsByEntity(entityType: EntityType, entityId: number): Promise<Tag[]>;
  findEntitiesByTag(tagId: number, entityType: EntityType): Promise<number[]>;
} 