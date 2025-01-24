import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArticles } from '@/api/articles';

interface ArticlesFilters {
  search: string;
  status: 'all' | 'draft' | 'published' | 'archived';
}

interface Pagination {
  page: number;
  limit: number;
}

export function useArticles() {
  const [filters, setFilters] = useState<ArticlesFilters>({
    search: '',
    status: 'all',
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
  });

  const { data: articles, isLoading, refetch: refreshArticles } = useQuery({
    queryKey: ['articles', filters, pagination],
    queryFn: () => getArticles({ ...filters, ...pagination }),
  });

  return {
    articles,
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshArticles,
  };
} 