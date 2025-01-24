import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useChatSessions } from '@/hooks/useChatSessions'
import { TablePageHeader } from '../ui/table-page-header'
import { ChatSessionsTable } from '../chat-sessions/ChatSessionsTable'
import { ChatSessionsFilters } from '../chat-sessions/ChatSessionsFilters'
import { ChatSessionDetail } from '../chat-sessions/ChatSessionDetail'
import { useToast } from '@/hooks/use-toast'
import { Button } from '../ui/button'
import { useTicketCreate } from '@/hooks/useTicketCreate'
import { Input } from '../ui/input'

export default function ChatSessions() {
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  const {
    sessions,
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshSessions,
    startNewSession,
  } = useChatSessions()

  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [showContactSearch, setShowContactSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<any>(null)

  const { contacts, isLoadingContacts } = useTicketCreate()

  // Handle URL parameters for panels
  useEffect(() => {
    const action = searchParams.get('action')
    const panel = searchParams.get('panel')
    
    if (action === 'create' && panel === 'new') {
      setShowContactSearch(true)
    }
  }, [searchParams])

  const handleStartNewSession = async () => {
    if (!selectedContact?.id) {
      toast({
        title: 'Error',
        description: 'Please select a contact first',
        variant: 'destructive'
      })
      return
    }

    try {
      const newSession = await startNewSession(selectedContact.id)
      setShowContactSearch(false)
      setSelectedContact(null)
      setSearchTerm('')
      toast({
        title: 'Success',
        description: 'New chat session started successfully',
      })
      setSelectedSessionId(newSession.id)
    } catch (error) {
      // Error is already handled in the hook
    }
  }

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact)
    setSearchTerm(contact.full_name)
  }

  return (
    <div className="flex h-full">
      {/* Main Content - Chat Sessions List */}
      <div className={`flex-1 min-w-0 overflow-auto p-4 lg:p-6 ${
        selectedSessionId ? 'hidden xl:block' : 'block'
      }`}>
        <TablePageHeader
          title="Chat Sessions"
          buttonLabel="New Chat"
          onAction={() => setShowContactSearch(true)}
        />
        
        {showContactSearch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Select Contact</h2>
                <button
                  onClick={() => {
                    setShowContactSearch(false)
                    setSelectedContact(null)
                    setSearchTerm('')
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full"
                  />
                  
                  {searchTerm && !selectedContact && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg bg-white shadow-lg border border-gray-200">
                      {isLoadingContacts ? (
                        <div className="py-3 px-4 text-sm text-gray-500">Loading contacts...</div>
                      ) : contacts.length > 0 ? (
                        <ul className="max-h-60 overflow-auto rounded-md py-2">
                          {contacts.map((contact) => (
                            <li
                              key={contact.id}
                              onClick={() => handleContactSelect(contact)}
                              className="relative cursor-pointer select-none py-2 px-4 hover:bg-gray-50 text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">{contact.full_name}</span>
                                  <span className="ml-2 text-gray-500">{contact.email}</span>
                                </div>
                                {contact.status === 'active' && (
                                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="py-3 px-4 text-sm text-gray-500">No contacts found</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowContactSearch(false)
                      setSelectedContact(null)
                      setSearchTerm('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStartNewSession}
                    disabled={!selectedContact}
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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