import { Suspense, useState } from 'react'
import { useChatSessions } from '@/hooks/useChatSessions'
import { TablePageHeader } from '../ui/table-page-header'
import { ChatSessionsTable } from '../chat-sessions/ChatSessionsTable'
import { ChatSessionsFilters } from '../chat-sessions/ChatSessionsFilters'
import { ChatSessionDetail } from '../chat-sessions/ChatSessionDetail'

export default function ChatSessions() {
  const {
    sessions,
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshSessions,
  } = useChatSessions()
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)

  return (
    <div className="flex h-full">
      {/* Main Content - Chat Sessions List */}
      <div className={`flex-1 min-w-0 overflow-auto p-4 lg:p-6 ${
        selectedSessionId ? 'hidden xl:block' : 'block'
      }`}>
        <TablePageHeader
          title="Chat Sessions"
          buttonLabel="New Chat"
          onAction={() => {}}
        />
        
        <ChatSessionsFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <div className="mt-4">
          <Suspense fallback={<div>Loading chat sessions...</div>}>
            <ChatSessionsTable 
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

      {/* Right Side Panel - Session Details */}
      <div className={`
        hidden xl:block w-[750px] border-l border-gray-200
        ${selectedSessionId ? '' : 'bg-gray-50'}
      `}>
        {selectedSessionId ? (
          <ChatSessionDetail 
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
          <ChatSessionDetail 
            sessionId={selectedSessionId}
            onClose={() => setSelectedSessionId(null)}
            onSessionUpdate={refreshSessions}
          />
        </div>
      )}
    </div>
  )
} 