import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArticle, saveArticle as saveArticleApi, publishArticle as publishArticleApi, deleteArticle as deleteArticleApi } from '@/api/articles';

interface Article {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    name: string;
  };
}

interface SaveArticleData {
  title: string;
  content: string;
  status: Article['status'];
}

interface PublishArticleData {
  title: string;
  content: string;
}

export function useArticleDetail(articleId?: number) {
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => articleId ? getArticle(articleId) : null,
    enabled: !!articleId,
  });

  const { mutateAsync: saveArticle } = useMutation({
    mutationFn: (data: SaveArticleData) => 
      articleId ? saveArticleApi(articleId, data) : saveArticleApi(undefined, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
    },
  });

  const { mutateAsync: publishArticle } = useMutation({
    mutationFn: (data: PublishArticleData) => 
      articleId ? publishArticleApi(articleId, data) : publishArticleApi(undefined, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
    },
  });

  const { mutateAsync: deleteArticle } = useMutation({
    mutationFn: (id: number) => deleteArticleApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  return {
    article,
    isLoading,
    saveArticle,
    publishArticle,
    deleteArticle,
  };
} 