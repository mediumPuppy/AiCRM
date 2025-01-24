import { Suspense, useState } from 'react'
import { useCustomerChatSessions } from '@/hooks/useCustomerChatSessions'
import { CustomerChatSessionsTable } from '../CustomerChatSessionsTable'
import { useToast } from '@/hooks/use-toast'
import CustomerChatSessionDetail from './CustomerChatSessionDetail'
import { TablePageHeader } from '@/components/ui/table-page-header'
import { useAuth } from '@/contexts/AuthContext'

export default function CustomerChatSessions() {
  const { contact } = useAuth()
  const { toast } = useToast()
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)

  // Ensure we have the required IDs
  if (!contact?.id || !contact?.company_id) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-4">
          Error: Missing required contact information
        </div>
      </div>
    )
  }

  const {
    sessions,
    isLoading,
    pagination,
    setPagination,
    startNewSession,
    refreshSessions
  } = useCustomerChatSessions(contact.id, contact.company_id)

  const handleStartNewSession = async () => {
    try {
      const newSession = await startNewSession()
      toast({
        title: 'Success',
        description: 'New chat session started successfully',
      })
      setSelectedSessionId(newSession.id)
    } catch (error) {
      // Error is already handled in the hook
    }
  }

  return (
    <div className="flex h-full">
      {/* Main Content - Chat Sessions List */}
      <div className={`flex-1 min-w-0 ${
        selectedSessionId ? 'hidden xl:block' : 'block'
      }`}>
        <div className="p-6">
          <TablePageHeader
            title="My Chat Sessions"
            buttonLabel="New Chat"
            onAction={handleStartNewSession}
          />

          <div className="bg-white rounded-lg shadow">
            <Suspense fallback={<div>Loading chat sessions...</div>}>
              <CustomerChatSessionsTable 
                sessions={sessions}
                isLoading={isLoading}
                pagination={pagination}
                onPaginationChange={setPagination}
                onSessionSelect={setSelectedSessionId}
                selectedSessionId={selectedSessionId}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Right Side Panel - Session Details */}
      <div className={`
        hidden xl:block w-[750px] border-l border-gray-200
        ${selectedSessionId ? '' : 'bg-gray-50'}
      `}>
        {selectedSessionId ? (
          <CustomerChatSessionDetail 
            sessionId={selectedSessionId}
            onClose={() => setSelectedSessionId(null)}
            onSessionUpdate={refreshSessions}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No Chat Session Selected</h3>
              <p>Select a chat session to view its details here</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Session Detail Modal */}
      {selectedSessionId && (
        <div className="fixed inset-0 z-50 xl:hidden bg-white overflow-auto">
          <CustomerChatSessionDetail 
            sessionId={selectedSessionId}
            onClose={() => setSelectedSessionId(null)}
            onSessionUpdate={refreshSessions}
          />
        </div>
      )}
    </div>
  )
} 