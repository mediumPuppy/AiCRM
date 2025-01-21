import { Article } from '../../types/article.types';

export class ArticleEntity implements Article {
  id: number;
  company_id: number;
  title: string;
  slug: string;
  content: string;
  status: Article['status'];
  revision: number;
  author_id: number | null;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
  metadata: Record<string, any> | null;

  constructor(data: Article) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.title = data.title;
    this.slug = data.slug;
    this.content = data.content;
    this.status = data.status;
    this.revision = data.revision;
    this.author_id = data.author_id;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
    this.published_at = data.published_at ? new Date(data.published_at) : null;
    this.metadata = data.metadata;
  }
} 