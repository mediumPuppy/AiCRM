import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArticle, saveArticle as saveArticleApi, publishArticle as publishArticleApi, deleteArticle as deleteArticleApi } from '@/api/articles';

export interface Article {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  slug: string;
  revision: number;
  author_id: number | null;
  company_id: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  metadata: Record<string, any> | null;
}

interface SaveArticleData {
  title: string;
  content?: string;
  status: Article['status'];
}

interface PublishArticleData {
  title: string;
  content: string;
}

interface ArticleError {
  message: string;
  details?: string;
}

export function useArticleDetail(articleId?: number) {
  const queryClient = useQueryClient();

  const { data: article, isLoading, error: fetchError } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      if (!articleId) return null;
      const result = await getArticle(articleId);
      return result;
    },
    enabled: !!articleId,
  });

  const { mutateAsync: saveArticle, error: saveError } = useMutation({
    mutationFn: async (data: SaveArticleData): Promise<Article> => {
      try {
        console.log('Attempting to save article:', { articleId, data });
        const result = await (articleId ? saveArticleApi(articleId, data) : saveArticleApi(undefined, data));
        console.log('Save successful:', result);
        return result;
      } catch (error) {
        console.error('Save failed:', error);
        const err = error as Error;
        throw new Error(err.message || 'Failed to save article');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
    },
  });

  const { mutateAsync: publishArticle, error: publishError } = useMutation({
    mutationFn: async (data: PublishArticleData): Promise<Article> => {
      try {
        console.log('Attempting to publish article:', { articleId, data });
        const result = await (articleId ? publishArticleApi(articleId, data) : publishArticleApi(undefined, data));
        console.log('Publish successful:', result);
        return result;
      } catch (error) {
        console.error('Publish failed:', error);
        const err = error as Error;
        throw new Error(err.message || 'Failed to publish article');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
    },
  });

  const { mutateAsync: deleteArticle, error: deleteError } = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      try {
        await deleteArticleApi(id);
      } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to delete article');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  const error = fetchError || saveError || publishError || deleteError;

  return {
    article,
    isLoading,
    error: error ? {
      message: error instanceof Error ? error.message : 'An error occurred',
      details: error instanceof Error ? error.stack : undefined,
    } as ArticleError : null,
    saveArticle,
    publishArticle,
    deleteArticle,
  };
} 