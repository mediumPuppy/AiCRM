import { Button } from './button';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface PaginationProps {
  total: number;
  pageSize: number;
  page: number;
  onChange: (page: number) => void;
}

export function Pagination({ total, pageSize, page, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <IconChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <IconChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
} 