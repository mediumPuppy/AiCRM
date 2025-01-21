import { SupabaseClient } from '@supabase/supabase-js';
import { ITagRepository } from '../interfaces/ITagRepository';
import { Tag, Taggable, CreateTagDTO, UpdateTagDTO, CreateTaggableDTO, EntityType } from '../../types/tag.types';
import { TagEntity, TaggableEntity } from '../../domain/entities/tag';

export class TagRepository implements ITagRepository {
  private readonly tagsTable = 'tags';
  private readonly taggablesTable = 'taggables';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateTagDTO): Promise<Tag> {
    const { data: tag, error } = await this.supabase
      .from(this.tagsTable)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new TagEntity(tag);
  }

  async findById(id: number): Promise<Tag | null> {
    const { data: tag, error } = await this.supabase
      .from(this.tagsTable)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return tag ? new TagEntity(tag) : null;
  }

  async findByCompanyId(companyId: number): Promise<Tag[]> {
    const { data: tags, error } = await this.supabase
      .from(this.tagsTable)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return tags.map(tag => new TagEntity(tag));
  }

  async update(id: number, data: UpdateTagDTO): Promise<Tag> {
    const { data: tag, error } = await this.supabase
      .from(this.tagsTable)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new TagEntity(tag);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tagsTable)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async addTagToEntity(data: CreateTaggableDTO): Promise<Taggable> {
    const { data: taggable, error } = await this.supabase
      .from(this.taggablesTable)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new TaggableEntity(taggable);
  }

  async removeTagFromEntity(tagId: number, entityType: EntityType, entityId: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.taggablesTable)
      .delete()
      .eq('tag_id', tagId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) throw error;
  }

  async findTagsByEntity(entityType: EntityType, entityId: number): Promise<Tag[]> {
    const { data: tags, error } = await this.supabase
      .from(this.taggablesTable)
      .select(`
        tag:tags (*)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) throw error;
    return tags.map((row: { tag: any }) => new TagEntity(row.tag));
  }

  async findEntitiesByTag(tagId: number, entityType: EntityType): Promise<number[]> {
    const { data: taggables, error } = await this.supabase
      .from(this.taggablesTable)
      .select('entity_id')
      .eq('tag_id', tagId)
      .eq('entity_type', entityType);

    if (error) throw error;
    return taggables.map(t => t.entity_id);
  }
} 