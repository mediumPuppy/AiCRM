import { Article, ArticleStatus, CreateArticleDTO, UpdateArticleDTO } from '../../types/article.types';

interface FindAllParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface IArticleRepository {
  findAll(params: FindAllParams): Promise<{ articles: Article[]; total: number }>;
  findById(id: number): Promise<Article | null>;
  findBySlug(companyId: number, slug: string): Promise<Article | null>;
  findByCompanyId(companyId: number): Promise<Article[]>;
  findByStatus(companyId: number, status: ArticleStatus): Promise<Article[]>;
  findByAuthor(authorId: number): Promise<Article[]>;
  update(id: number, data: UpdateArticleDTO): Promise<Article>;
  publish(id: number): Promise<Article>;
  archive(id: number): Promise<Article>;
  delete(id: number): Promise<void>;
  search(query: string): Promise<Article[]>;
  create(data: CreateArticleDTO): Promise<Article>;
} 