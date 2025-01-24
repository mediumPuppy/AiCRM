import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { formatDate } from '@/utils/formatDate';
import { Pagination } from '@/components/ui/pagination';

interface Article {
  id: number;
  title: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
  };
}

interface ArticlesTableProps {
  articles: {
    articles: Article[];
    total: number;
  };
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
  };
  onPaginationChange: (pagination: { page: number; limit: number }) => void;
  onArticleSelect: (articleId: number) => void;
  selectedArticleId: number | null;
}

export function ArticlesTable({
  articles,
  isLoading,
  pagination,
  onPaginationChange,
  onArticleSelect,
  selectedArticleId,
}: ArticlesTableProps) {
  const getStatusColor = (status: Article['status']): "default" | "secondary" | "destructive" | "outline" => {
    const colors = {
      draft: 'default',
      published: 'secondary',
      archived: 'outline'
    } as const;
    return colors[status];
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading articles...</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.articles.map((article) => (
            <TableRow
              key={article.id}
              className={`cursor-pointer hover:bg-gray-50 ${
                selectedArticleId === article.id ? 'bg-gray-50' : ''
              }`}
              onClick={() => onArticleSelect(article.id)}
            >
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(article.status)}>
                  {article.status}
                </Badge>
              </TableCell>
              <TableCell>{article.author?.name || 'Unknown'}</TableCell>
              <TableCell>{formatDate(article.updated_at)}</TableCell>
              <TableCell>{formatDate(article.created_at)}</TableCell>
            </TableRow>
          ))}
          {articles.articles.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                No articles found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-end">
        <Pagination
          total={articles.total}
          pageSize={pagination.limit}
          page={pagination.page}
          onChange={(newPage: number) => onPaginationChange({ ...pagination, page: newPage })}
        />
      </div>
    </div>
  );
} 