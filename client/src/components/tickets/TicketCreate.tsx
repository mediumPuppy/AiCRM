import { useState } from 'react'
import { useTicketCreate } from '@/hooks/useTicketCreate'
import { useCreateContact } from '@/hooks/useCreateContact'
import { useQueryClient } from '@tanstack/react-query'

interface TicketCreateProps {
  onClose: () => void
  onTicketCreated?: () => void
}

type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export function TicketCreate({ onClose, onTicketCreated }: TicketCreateProps) {
  // Add queryClient at the top of the component
  const queryClient = useQueryClient()
  
  // Form state
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TicketStatus>('open')
  const [priority, setPriority] = useState<TicketPriority>('normal')
  const [contactId, setContactId] = useState<number | null>(null)
  const [isCreatingContact, setIsCreatingContact] = useState(false)
  const [newContactData, setNewContactData] = useState({
    full_name: '',
    email: '',
    phone: '',
  })

  const {
    contacts,
    isLoadingContacts,
    searchTerm,
    setSearchTerm,
    createTicket,
    isCreating
  } = useTicketCreate()

  const createContactMutation = useCreateContact()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim()) {
      return
    }

    try {
      await createTicket({
        subject,
        description,
        status,
        priority,
        contact_id: contactId || undefined,
      })
      
      // Invalidate both tickets and related queries
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] }) // If you have stats
      
      // Call the success callback
      onTicketCreated?.()
      // Close the modal
      onClose()
    } catch (error) {
      console.error('Failed to create ticket:', error)
      // TODO: Add error handling UI
    }
  }

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const contact = await createContactMutation.mutateAsync({
        company_id: 1, // TODO: Get from context
        ...newContactData,
        status: 'active'
      })
      
      // Invalidate contacts list after creation
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      
      setContactId(contact.id)
      setSearchTerm(contact.full_name)
      setIsCreatingContact(false)
      
      // Reset form
      setNewContactData({
        full_name: '',
        email: '',
        phone: '',
      })
    } catch (error) {
      console.error('Failed to create contact:', error)
      // TODO: Add error handling UI
    }
  }

  const handleContactSelect = (contact: any) => {
    setContactId(contact.id)
    setSearchTerm(contact.full_name)
    setSelectedContact(contact)
    setShowDropdown(false)
  }

  // Add new state for tracking selected contact and dropdown visibility
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Create New Ticket</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close panel</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-auto">
        {/* Main Column - Form Fields */}
        <div className="flex-1 order-1 lg:order-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter ticket subject"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter ticket description"
                required
              />
            </div>

            {/* Contact Selection/Creation */}
            <div className="space-y-2">
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                Contact
              </label>
              <div className="mt-1">
                {!isCreatingContact ? (
                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setShowDropdown(true)
                          if (!e.target.value) {
                            setSelectedContact(null)
                            setContactId(null)
                          }
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Search contacts..."
                      />
                      <button
                        type="button"
                        onClick={() => setIsCreatingContact(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        New
                      </button>
                    </div>
                    {showDropdown && searchTerm && !selectedContact && (
                      <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                        {isLoadingContacts ? (
                          <div className="py-2 px-3 text-gray-500">Loading contacts...</div>
                        ) : contacts.length > 0 ? (
                          <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                            {contacts.map((contact) => (
                              <li
                                key={contact.id}
                                onClick={() => handleContactSelect(contact)}
                                className="relative cursor-pointer select-none py-2 px-3 hover:bg-gray-100"
                              >
                                <div className="flex items-center">
                                  <span className="font-medium">{contact.full_name}</span>
                                  <span className="ml-2 text-sm text-gray-500">{contact.email}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="py-2 px-3 text-gray-500">No contacts found</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // New contact creation - now separate from main form
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="newContactName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="newContactName"
                        value={newContactData.full_name}
                        onChange={(e) => setNewContactData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="newContactEmail" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="newContactEmail"
                        value={newContactData.email}
                        onChange={(e) => setNewContactData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="newContactPhone" className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="newContactPhone"
                        value={newContactData.phone}
                        onChange={(e) => setNewContactData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCreateContact}
                        disabled={createContactMutation.isPending}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {createContactMutation.isPending ? 'Creating...' : 'Create Contact'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingContact(false)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Move inside form */}
        <div className="lg:w-72 order-2 lg:order-2 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* Status Selection */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Selection */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Create Button */}
            <button
              type="submit"
              disabled={isCreating}
              onClick={(e) => {
                e.preventDefault()
                handleSubmit(e)
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 