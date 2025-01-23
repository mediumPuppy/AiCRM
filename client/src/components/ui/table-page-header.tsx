import { Button } from './button'
import { IconPlus } from '@tabler/icons-react'

interface TablePageHeaderProps {
  title: string
  description?: string
  buttonLabel: string
  onAction: () => void
}

export function TablePageHeader({ title, description, buttonLabel, onAction }: TablePageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <Button 
        className="flex-shrink-0 px-3 sm:px-3" 
        size="sm"
        onClick={onAction}
      >
        <IconPlus className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">{buttonLabel}</span>
      </Button>
    </div>
  )
} 