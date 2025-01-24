import { Article } from '../../types/article.types';

export class ArticleEntity implements Article {
  id: number;
  slug: string;
  title: string;
  content: string;
  status: Article['status'];
  revision: number;
  author_id: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  metadata: Record<string, any> | null;

  constructor(data: Article) {
    this.id = data.id;
    this.slug = data.slug;
    this.title = data.title;
    this.content = data.content;
    this.status = data.status;
    this.revision = data.revision;
    this.author_id = data.author_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.published_at = data.published_at;
    this.metadata = data.metadata;
  }
} 