import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useCreateContact } from '@/hooks/useCreateContact'
import { useQueryClient } from '@tanstack/react-query'
import { IconX } from '@tabler/icons-react'

interface ContactCreateProps {
  onClose: () => void
  onContactCreated?: () => void
}

export function ContactCreate({ onClose, onContactCreated }: ContactCreateProps) {
  const queryClient = useQueryClient()
  const createContactMutation = useCreateContact()
  
  // Form state
  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    phone: string;
    status: 'active' | 'archived';
  }>({
    full_name: '',
    email: '',
    phone: '',
    status: 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.full_name.trim()) {
      return
    }

    try {
      await createContactMutation.mutateAsync({
        company_id: 1, // TODO: Get from context
        ...formData
      })
      
      // Invalidate contacts list after creation
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      
      // Call the success callback
      onContactCreated?.()
      // Close the modal
      onClose()
    } catch (error) {
      console.error('Failed to create contact:', error)
      // TODO: Add error handling UI
    }
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Create New Contact</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close panel</span>
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-auto">
        {/* Main Column - Form Fields */}
        <div className="flex-1 order-1 lg:order-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter contact's full name"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter contact's email"
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter contact's phone number"
              />
            </div>
          </form>
        </div>

        {/* Right Column */}
        <div className="lg:w-72 order-2 lg:order-2 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'archived' }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Create Button */}
            <Button
              className="w-full"
              disabled={createContactMutation.isPending}
              onClick={handleSubmit}
            >
              {createContactMutation.isPending ? 'Creating...' : 'Create Contact'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 