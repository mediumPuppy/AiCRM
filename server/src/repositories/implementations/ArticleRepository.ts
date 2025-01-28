import { SupabaseClient } from '@supabase/supabase-js';
import { IArticleRepository } from '../interfaces/IArticleRepository';
import { Article, CreateArticleDTO, UpdateArticleDTO, ArticleStatus } from '../../types/article.types';
import { ArticleEntity } from '../../domain/entities/article';

export class ArticleRepository implements IArticleRepository {
  private readonly tableName = 'articles';

  constructor(private readonly supabase: SupabaseClient) {}

  async findAll({ page, limit, search, status }: {
    page: number;
    limit: number;
    search?: string;
    status?: 'draft' | 'published' | 'archived';
  }): Promise<{ articles: Article[]; total: number }> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' });

    if (search) {
      query = query.textSearch('search_vector', search);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data: articles, count, error } = await query
      .range(start, end)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      articles: articles.map(article => new ArticleEntity(article) as Article),
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
    return article ? (new ArticleEntity(article) as Article) : null;
  }

  async findBySlug(companyId: number, slug: string): Promise<Article | null> {
    const { data: article, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return article ? (new ArticleEntity(article) as Article) : null;
  }

  async findByCompanyId(companyId: number): Promise<Article[]> {
    const { data: articles, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return articles.map(article => new ArticleEntity(article) as Article);
  }

  async findByStatus(companyId: number, status: ArticleStatus): Promise<Article[]> {
    const { data: articles, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId)
      .eq('status', status);

    if (error) throw error;
    return articles.map(article => new ArticleEntity(article) as Article);
  }

  async findByAuthor(authorId: number): Promise<Article[]> {
    const { data: articles, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('author_id', authorId);

    if (error) throw error;
    return articles.map(article => new ArticleEntity(article) as Article);
  }

  async search(query: string): Promise<Article[]> {
    const { data: articles, error } = await this.supabase
      .from(this.tableName)
      .select()
      .textSearch('title || \' \' || content', query, {
        type: 'plain',
        config: 'english'
      })
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return articles.map(article => new ArticleEntity(article) as Article);
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
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update article:', error);
      throw error;
    }
    return new ArticleEntity(article);
  }

  async publish(id: number): Promise<Article> {
    const { data: article, error } = await this.supabase
      .from(this.tableName)
      .update({ 
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to publish article:', error);
      throw error;
    }
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