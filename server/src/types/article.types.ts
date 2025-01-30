export type ArticleStatus = 'draft' | 'published' | 'archived';

export type Article = {
  id: number;
  title: string;
  content: string;
  slug: string;
  status: ArticleStatus;
  revision: number;
  author_id: number | null;
  company_id: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  metadata: Record<string, any> | null;
};

export type CreateArticleDTO = {
  title: string;
  content: string;
  slug: string;
  author_id: number;
  company_id: number;
  status?: ArticleStatus;
  metadata?: Record<string, any>;
};

export type UpdateArticleDTO = {
  title?: string;
  content?: string;
  status?: ArticleStatus;
  revision?: number;
  metadata?: Record<string, any>;
  published_at?: string | null;
}; 