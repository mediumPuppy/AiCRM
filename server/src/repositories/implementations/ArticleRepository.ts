import { SupabaseClient } from '@supabase/supabase-js';
import { IArticleRepository } from '../interfaces/IArticleRepository';
import { Article, CreateArticleDTO, UpdateArticleDTO, ArticleStatus } from '../../types/article.types';
import { ArticleEntity } from '../../domain/entities/article';

export class ArticleRepository implements IArticleRepository {
  private readonly tableName = 'articles';

  constructor(private readonly supabase: SupabaseClient) {}

  async findAll({ page, limit, category, published, companyId }: {
    page: number;
    limit: number;
    category?: string;
    published?: boolean;
    companyId?: number;
  }): Promise<{ articles: Article[]; total: number }> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    if (typeof published === 'boolean') {
      query = published 
        ? query.not('published_at', 'is', null)
        : query.is('published_at', null);
    }

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data: articles, count, error } = await query
      .range(start, end)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      articles: articles.map(article => new ArticleEntity(article)),
      total: count || 0
    };
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

  async search(query: string): Promise<Article[]> {
    const { data: articles, error } = await this.supabase
      .from(this.tableName)
      .select()
      .textSearch('search_vector', query)
      .eq('published', true);

    if (error) throw error;
    return articles.map(article => new ArticleEntity(article));
  }

  async create(data: CreateArticleDTO): Promise<Article> {
    const { data: article, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new ArticleEntity(article);
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