import { Suspense } from 'react'
import { useCustomerChatSessions } from '@/hooks/useCustomerChatSessions'
import { CustomerChatSessionsTable } from '../CustomerChatSessionsTable'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

// Hardcoded mock user for development
const mockUser = {
  contact_id: 1,  // Using ID from seed data
  company_id: 1   // Using Acme Corp ID from seed data
}

export default function CustomerChatSessions() {
  const { toast } = useToast()

  // // Ensure we have the required IDs
  // if (!user?.contact_id || !user?.company_id) {
  //   return (
  //     <div className="p-6">
  //       <div className="bg-white rounded-lg shadow p-4">
  //         Error: Missing required user information
  //       </div>
  //     </div>
  //   )
  // }

  const {
    sessions,
    isLoading,
    pagination,
    setPagination,
    startNewSession
  } = useCustomerChatSessions(mockUser.contact_id, mockUser.company_id)

  const handleStartNewSession = async () => {
    try {
      await startNewSession()
      toast({
        title: 'Success',
        description: 'New chat session started successfully',
      })
    } catch (error) {
      // Error is already handled in the hook
    }
  }

  return (
    <>
      <header className="border-b h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">My Chat Sessions</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleStartNewSession}>
            Start New Chat
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          <Suspense fallback={<div>Loading chat sessions...</div>}>
            <CustomerChatSessionsTable 
              sessions={sessions}
              isLoading={isLoading}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
} 