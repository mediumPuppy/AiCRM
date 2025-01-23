type DateFormatOptions = {
  includeYear?: boolean;
  includeTime?: boolean;
  format?: 'default' | 'table';
};

export function formatDate(date: string | Date, options: DateFormatOptions = { includeTime: true, includeYear: false }) {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDate:', date);
    return 'Invalid date';
  }

  try {
    if (options.format === 'table') {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      ...(options.includeYear && { year: 'numeric' }),
      ...(options.includeTime && {
        hour: 'numeric',
        minute: 'numeric',
      }),
    };

    return dateObj.toLocaleString('en-US', formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error formatting date';
  }
}

// Usage examples:
// formatDate('2024-03-14T15:30:00Z')                    -> "Mar 14, 3:30 PM"
// formatDate('2024-03-14T15:30:00Z', { includeYear: true }) -> "Mar 14, 2024, 3:30 PM"
// formatDate('2024-03-14T15:30:00Z', { includeTime: false }) -> "Mar 14" 