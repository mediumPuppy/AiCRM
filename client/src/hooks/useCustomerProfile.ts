import { useAuth } from '@/contexts/AuthContext'
import { useContactDetail } from './useContactDetail'
import { useUpdateContact } from '@/hooks/useUpdateContact'
import { useToast } from './use-toast'
import type { Contact } from '@/api/contacts'

export function useCustomerProfile() {
  const { contact } = useAuth()
  const { toast } = useToast()
  const contactId = contact?.id

  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useContactDetail(contactId || 0)

  const { updateContact } = useUpdateContact()

  const updateProfile = async (data: Partial<Contact>) => {
    if (!contactId) return

    try {
      await updateContact(contactId, data)
      await refetch()
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    }
  }

  return {
    profile,
    isLoading,
    error,
    updateProfile
  }
} 