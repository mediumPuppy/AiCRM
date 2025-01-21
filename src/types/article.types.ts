export type ArticleStatus = 'draft' | 'published' | 'archived';

export type Article = {
  id: number;
  company_id: number;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  revision: number;
  author_id: number | null;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
  metadata: Record<string, any> | null;
};

export type CreateArticleDTO = {
  company_id: number;
  title: string;
  slug: string;
  content: string;
  author_id: number;
  status?: 'draft' | 'published' | 'archived';
  metadata?: Record<string, any>;
};

export type UpdateArticleDTO = {
  title?: string;
  slug?: string;
  content?: string;
  status?: 'draft' | 'published' | 'archived';
  revision?: number;
  metadata?: Record<string, any>;
  published_at?: string | null;
}; 