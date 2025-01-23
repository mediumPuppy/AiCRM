import { Suspense, useState } from 'react'
import { ContactsTable } from '../contacts/ContactsTable'
import { ContactsFilters } from '../contacts/ContactsFilters'
import { useContacts } from '@/hooks/useContacts'
import { ContactDetail } from '../contacts/ContactDetail'
import { TablePageHeader } from '../ui/table-page-header'

export default function Contacts() {
  // TODO: Replace with actual company ID from auth/context
  const tempCompanyId = 1

  const {
    contacts,
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshContacts,
  } = useContacts(tempCompanyId)
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null)

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0 overflow-auto p-4 lg:p-6">
        <TablePageHeader
          title="Contacts"
          buttonLabel="New Contact"
          onAction={() => {/* implement new contact modal */}}
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

      {/* Right Side Panel - Contact Details */}
      <div className="hidden xl:block w-[750px] border-l border-gray-200 flex-shrink-0">
        {selectedContactId ? (
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

      {/* Mobile Contact Detail Modal */}
      {selectedContactId && (
        <div className="fixed inset-0 z-50 xl:hidden bg-white overflow-auto">
          <ContactDetail 
            contactId={selectedContactId} 
            onClose={() => setSelectedContactId(null)}
            onContactUpdate={refreshContacts}
          />
        </div>
      )}
    </div>
  )
} 