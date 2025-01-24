import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ArticlesFilters {
  search: string;
  status: 'all' | 'draft' | 'published' | 'archived';
}

interface ArticlesFiltersProps {
  filters: ArticlesFilters;
  onFiltersChange: (filters: ArticlesFilters) => void;
}

export function ArticlesFilters({ filters, onFiltersChange }: ArticlesFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4">
      <Input
        placeholder="Search articles..."
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        className="sm:w-[300px]"
      />
      
      <Select
        value={filters.status}
        onValueChange={(value: ArticlesFilters['status']) => 
          onFiltersChange({ ...filters, status: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 