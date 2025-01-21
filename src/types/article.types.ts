export type ArticleStatus = 'draft' | 'published' | 'archived';

export type Article = {
  id: number;
  company_id: number;
  title: string;
  slug: string;
  content: string;
  status: ArticleStatus;
  revision: number;
  author_id: number | null;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
  metadata: Record<string, any> | null;
};

export type CreateArticleDTO = Omit<Article, 'id' | 'created_at' | 'updated_at' | 'revision'>;
export type UpdateArticleDTO = Partial<Omit<CreateArticleDTO, 'company_id'>>; 