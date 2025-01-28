import { useState } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { useUsersDetail } from '@/hooks/useUserDetail'
import { useMemo } from 'react'

interface Note {
  id: number;
  message: string;
  sender_id: number;
  created_at: string;
}

interface TicketNotesProps {
  notes: Note[];
  onAddNote: (note: string) => void
}

export function TicketNotes({ notes, onAddNote }: TicketNotesProps) {
  const [newNote, setNewNote] = useState('')

  // Get unique agent IDs from notes
  const agentIds = useMemo(() => {
    const ids = new Set<number>();
    notes.forEach(note => {
      if (note.sender_id) {
        ids.add(note.sender_id);
      }
    });
    return Array.from(ids);
  }, [notes]);

  // Fetch agent details
  const agentDetails = useUsersDetail(agentIds);

  // Create a map of agent IDs to their data
  const agents = Object.fromEntries(
    agentIds.map((id, index) => [id, agentDetails[index].data])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newNote.trim()) {
      onAddNote(newNote)
      setNewNote('')
    }
  }

  // Sort notes by created_at in descending order (newest first)
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={newNote}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
          placeholder="Add an internal note..."
          rows={4}
        />
        <Button 
          type="submit" 
          disabled={!newNote.trim()}
          variant="default"
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          Add Note
        </Button>
      </form>

      <div className="space-y-4">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notes available
          </div>
        ) : (
          sortedNotes.map((note) => {
            const agent = agents[note.sender_id];
            
            return (
              <div key={note.id} className="flex gap-4">
                <Avatar className="flex-shrink-0 w-10 h-10">
                  <AvatarFallback>
                    {agent?.full_name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {agent?.full_name || `Agent #${note.sender_id}`}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(note.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{note.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  )
} 