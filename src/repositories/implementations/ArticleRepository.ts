import { SupabaseClient } from '@supabase/supabase-js';
import { IArticleRepository } from '../interfaces/IArticleRepository';
import { Article, CreateArticleDTO, UpdateArticleDTO, ArticleStatus } from '../../types/article.types';
import { ArticleEntity } from '../../domain/entities/article';

export class ArticleRepository implements IArticleRepository {
  private readonly tableName = 'articles';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateArticleDTO): Promise<Article> {
    const { data: article, error } = await this.supabase
      .from(this.tableName)
      .insert({ ...data, revision: 1 })
      .select()
      .single();

    if (error) throw error;
    return new ArticleEntity(article);
  }

  async findById(id: number): Promise<Article | null> {
    const { data: article, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return article ? new ArticleEntity(article) : null;
  }

  async findBySlug(companyId: number, slug: string): Promise<Article | null> {
    const { data: article, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return article ? new ArticleEntity(article) : null;
  }

  async findByCompanyId(companyId: number): Promise<Article[]> {
    const { data: articles, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return articles.map(article => new ArticleEntity(article));
  }

  async findByStatus(companyId: number, status: ArticleStatus): Promise<Article[]> {
    const { data: articles, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId)
      .eq('status', status);

    if (error) throw error;
    return articles.map(article => new ArticleEntity(article));
  }

  async findByAuthor(authorId: number): Promise<Article[]> {
    const { data: articles, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('author_id', authorId);

    if (error) throw error;
    return articles.map(article => new ArticleEntity(article));
  }

  async update(id: number, data: UpdateArticleDTO): Promise<Article> {
    const { data: article, error } = await this.supabase
      .from(this.tableName)
      .update({ 
        ...data, 
        revision: this.supabase.rpc('increment', { value: 1 })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ArticleEntity(article);
  }

  async publish(id: number): Promise<Article> {
    const { data: article, error } = await this.supabase
      .from(this.tableName)
      .update({ 
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ArticleEntity(article);
  }

  async archive(id: number): Promise<Article> {
    const { data: article, error } = await this.supabase
      .from(this.tableName)
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ArticleEntity(article);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 