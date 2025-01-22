import axios from 'axios';

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  published: boolean;
  company_id: number;
  created_at: string;
  updated_at: string;
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
  companyId: number;
  page: number;
  limit: number;
  published?: boolean;
  category?: string;
}

export const articlesApi = {
  getByCompany: async (params: GetArticlesParams) => {
    try {
      // Log the request parameters      
      const { data } = await axios.get<PaginatedResponse<Article>>(`/api/articles`, {
        params: {
          companyId: Number(params.companyId),
          page: params.page || 1,
          limit: params.limit || 10,
          category: params.category,
          published: params.published
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