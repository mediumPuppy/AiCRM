import { Article, CreateArticleDTO, UpdateArticleDTO, ArticleStatus } from '../../types/article.types';

export interface IArticleRepository {
  create(data: CreateArticleDTO): Promise<Article>;
  findById(id: number): Promise<Article | null>;
  findBySlug(companyId: number, slug: string): Promise<Article | null>;
  findByCompanyId(companyId: number): Promise<Article[]>;
  findByStatus(companyId: number, status: ArticleStatus): Promise<Article[]>;
  findByAuthor(authorId: number): Promise<Article[]>;
  update(id: number, data: UpdateArticleDTO): Promise<Article>;
  publish(id: number): Promise<Article>;
  archive(id: number): Promise<Article>;
  delete(id: number): Promise<void>;
} 