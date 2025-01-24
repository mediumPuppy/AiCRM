import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDate } from '../../utils/formatDate';
import { useContactDetail } from '@/hooks/useContactDetail';
import { useUpdateContact } from '@/hooks/useUpdateContact';
import { ContactNotes } from './ContactNotes';
import { IconX } from '@tabler/icons-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useContactTickets } from '@/hooks/useContactTickets';
import { useNotes } from '@/hooks/useNotes';
import { TicketsTable } from '../tickets/TicketsTable';
import { TicketDetail } from '../tickets/TicketDetail';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ContactDetailProps {
  contactId: number;
  onClose: () => void;
  onContactUpdate?: () => void;
}

type ContactStatus = 'active' | 'archived';

export function ContactDetail({ contactId, onClose, onContactUpdate }: ContactDetailProps) {
  const [selectedTab, setSelectedTab] = useState('details');
  const [pendingStatus, setPendingStatus] = useState<ContactStatus | null>(null);
  const { 
    data: contact, 
    isLoading, 
    error
  } = useContactDetail(contactId);
  const { notes, isLoading: isLoadingNotes, addNote } = useNotes('contact', contactId);
  const { updateContact } = useUpdateContact();
  const { tickets, isLoading: isLoadingTickets } = useContactTickets(contactId);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const handleStatusChange = async (newStatus: ContactStatus) => {
    if (!contact) return;
    try {
      await updateContact(contactId, { status: newStatus });
      onContactUpdate?.();
      setPendingStatus(null);
    } catch (error) {
      console.error('Failed to update contact status:', error);
    }
  };

  // const getStatusColor = (status: Ticket['status']) => {
  //   const colors = {
  //     open: 'default',
  //     in_progress: 'secondary',
  //     waiting: 'warning',
  //     resolved: 'success',
  //     closed: 'outline'
  //   };
  //   return colors[status];
  // };

  // const getPriorityColor = (priority: Ticket['priority']) => {
  //   const colors = {
  //     urgent: 'destructive',
  //     high: 'warning',
  //     normal: 'default',
  //     low: 'outline'
  //   };
  //   return colors[priority];
  // };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse">Loading contact details...</div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-red-500">Error loading contact details</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <div className="flex items-center min-w-0">
          <h2 className="text-lg font-medium truncate">{contact.full_name}</h2>
          <Badge variant={contact.status === 'active' ? 'default' : 'secondary'} className="ml-2">
            {contact.status}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex">
        {/* Left column */}
        <div className="flex-1 min-w-0 border-r">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1">{contact.email || 'No email provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="mt-1">{contact.phone || 'No phone provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1">{formatDate(contact.created_at)}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="p-4">
              <div className="space-y-4">
                {isLoadingTickets ? (
                  <div className="text-center py-4">Loading tickets...</div>
                ) : (
                  <>
                    <TicketsTable
                      tickets={tickets}
                      isLoading={isLoadingTickets}
                      pagination={{ page: 1, limit: 10 }}
                      onPaginationChange={() => {}}
                      onTicketSelect={setSelectedTicketId}
                      selectedTicketId={selectedTicketId}
                    />
                    
                    {/* Ticket Detail Modal */}
                    {selectedTicketId && (
                      <div className="fixed inset-0 z-50 bg-white overflow-auto">
                        <TicketDetail 
                          ticketId={selectedTicketId} 
                          onClose={() => setSelectedTicketId(null)}
                          onTicketUpdate={() => {
                            // Refresh tickets when a ticket is updated
                            // This will be handled by the useContactTickets hook's refetch
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <ContactNotes 
                notes={notes || []}
                onAddNote={addNote}
                isLoading={isLoadingNotes}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Metadata */}
        <div className="hidden lg:block w-72 p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <Select 
                value={contact.status} 
                onValueChange={(value: ContactStatus) => setPendingStatus(value)}
              >
                <SelectTrigger className="mt-1 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" className="w-36">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contact.portal_enabled && (
              <div>
                <label className="block text-sm text-gray-500">
                  Portal Information
                </label>
                <div className="mt-2 text-sm text-gray-600">
                  <div className="flex justify-between py-1">
                    <span>Username</span>
                    <span className="font-medium">{contact.portal_username}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Last Login</span>
                    <span className="font-medium">
                      {contact.last_portal_login ? formatDate(contact.last_portal_login) : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Status Section */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-500">Status</label>
            <Select 
              value={contact.status} 
              onValueChange={(value: ContactStatus) => setPendingStatus(value)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" side="top" align="end" className="w-36">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Change Confirmation Dialog */}
        <AlertDialog open={!!pendingStatus} onOpenChange={() => setPendingStatus(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingStatus === 'archived' ? 'Archive Contact' : 'Activate Contact'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingStatus === 'archived' 
                  ? 'Are you sure you want to archive this contact? This action can be reversed later.'
                  : 'Are you sure you want to activate this contact? This will make them visible in the main contacts list.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingStatus(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => pendingStatus && handleStatusChange(pendingStatus)}
              >
                {pendingStatus === 'archived' ? 'Archive' : 'Activate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 