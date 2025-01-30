import axios from 'axios';

// Helper function to generate URL-friendly slugs
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface Article {
  id: number;
  title: string;
  content: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  revision: number;
  author_id: number | null;
  company_id: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  metadata: Record<string, any> | null;
}

/** Response from paginated API endpoints */
export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/** Parameters for fetching articles */
export interface GetArticlesParams {
  search?: string;
  status?: 'all' | 'draft' | 'published' | 'archived';
  page: number;
  limit: number;
  companyId?: number;
}

interface ArticlesResponse {
  articles: Article[];
  total: number;
}

export async function getArticles(params: GetArticlesParams): Promise<ArticlesResponse> {
  const { data } = await axios.get('/api/articles', { params });
  return data;
}

export async function getArticle(id: number): Promise<Article> {
  const { data } = await axios.get(`/api/articles/${id}`);
  return data;
}

export async function saveArticle(id: number | undefined, data: { title: string; content?: string; status: Article['status'] }): Promise<Article> {
  // Get current user and company from auth context
  const auth = JSON.parse(localStorage.getItem('userData') || '{}');
  const author_id = auth?.id;
  const company_id = auth?.company_id;

  if (!author_id || !company_id) {
    throw new Error('User not authenticated');
  }

  const slug = generateSlug(data.title);
  const payload = { ...data, author_id, company_id, slug };
  
  if (typeof id === 'number') {
    const { data: response } = await axios.put(`/api/articles/${id}`, payload);
    return response;
  } else {
    // For new articles, content is required
    if (!data.content) {
      throw new Error('Content is required for new articles');
    }
    const { data: response } = await axios.post('/api/articles', payload);
    return response;
  }
}

export async function publishArticle(id: number | undefined, data: { title: string; content: string }): Promise<Article> {
  // Get current user and company from auth context
  const auth = JSON.parse(localStorage.getItem('userData') || '{}');
  const author_id = auth?.id;
  const company_id = auth?.company_id;

  if (!author_id || !company_id) {
    throw new Error('User not authenticated');
  }

  const slug = generateSlug(data.title);
  
  if (typeof id === 'number') {
    const { data: response } = await axios.post(`/api/articles/${id}/publish`, { ...data, author_id });
    return response;
  } else {
    const { data: response } = await axios.post('/api/articles', { 
      ...data, 
      author_id,
      company_id,
      slug,
      status: 'published',
      published_at: new Date().toISOString()
    });
    return response;
  }
}

export async function deleteArticle(id: number): Promise<void> {
  await axios.delete(`/api/articles/${id}`);
}

export const articlesApi = {
  getByCompany: async (params: GetArticlesParams) => {
    try {
      // Log the request parameters      
      const { data } = await axios.get<PaginatedResponse<Article>>(`/api/articles`, {
        params: {
          search: params.search,
          status: params.status,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to fetch articles:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          url: error.config?.url,
          params: error.config?.params
        });
      }
      throw new Error('Failed to fetch articles: ' + (error as Error).message);
    }
  },

  search: async (query: string) => {
    try {
      const { data } = await axios.get<Article[]>(`/api/articles/search?q=${query}`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to search articles:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const { data } = await axios.get<Article>(`/api/articles/${id}`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to fetch article:', error.response?.data || error.message);
      }
      throw error;
    }
  }
}; 