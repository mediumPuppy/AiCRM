import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ContactsTable } from '../contacts/ContactsTable'
import { ContactsFilters } from '../contacts/ContactsFilters'
import { useContacts } from '@/hooks/useContacts'
import { ContactDetail } from '../contacts/ContactDetail'
import { ContactCreate } from '../contacts/ContactCreate'
import { TablePageHeader } from '../ui/table-page-header'
import { useAuth } from '../../contexts/AuthContext'

export default function Contacts() {
  const [searchParams] = useSearchParams()
  const { user, contact } = useAuth()
  const companyId = user?.company_id || contact?.company_id
  if (!companyId) throw new Error('No company ID found in auth context')

  const {
    contacts,
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshContacts,
  } = useContacts(companyId)
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null)
  const [isCreatingContact, setIsCreatingContact] = useState(false)

  // Handle URL parameters for panels
  useEffect(() => {
    const action = searchParams.get('action')
    const panel = searchParams.get('panel')
    
    if (action === 'create' && panel === 'new') {
      setIsCreatingContact(true)
    }
  }, [searchParams])

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0 overflow-auto p-4 lg:p-6">
        <TablePageHeader
          title="Contacts"
          buttonLabel="New Contact"
          onAction={() => setIsCreatingContact(true)}
        />
        
        <ContactsFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <div className="mt-4">
          <Suspense fallback={<div>Loading contacts...</div>}>
            <ContactsTable 
              contacts={contacts ?? { contacts: [], total: 0 }}
              isLoading={isLoading}
              pagination={pagination}
              onPaginationChange={setPagination}
              onContactSelect={setSelectedContactId}
              selectedContactId={selectedContactId}
            />
          </Suspense>
        </div>
      </div>

      {/* Right Side Panel - Contact Details/Create */}
      <div className="hidden xl:block w-[750px] border-l border-gray-200 flex-shrink-0">
        {isCreatingContact ? (
          <ContactCreate
            onClose={() => setIsCreatingContact(false)}
            onContactCreated={() => {
              refreshContacts()
              setIsCreatingContact(false)
            }}
          />
        ) : selectedContactId ? (
          <ContactDetail 
            contactId={selectedContactId} 
            onClose={() => setSelectedContactId(null)}
            onContactUpdate={refreshContacts}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No Contact Selected</h3>
              <p>Click on a contact to view their details here</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Contact Detail/Create Modal */}
      {(selectedContactId || isCreatingContact) && (
        <div className="fixed inset-0 z-50 xl:hidden bg-white overflow-auto">
          {isCreatingContact ? (
            <ContactCreate
              onClose={() => setIsCreatingContact(false)}
              onContactCreated={() => {
                refreshContacts()
                setIsCreatingContact(false)
              }}
            />
          ) : (
            <ContactDetail 
              contactId={selectedContactId!} 
              onClose={() => setSelectedContactId(null)}
              onContactUpdate={refreshContacts}
            />
          )}
        </div>
      )}
    </div>
  )
} 