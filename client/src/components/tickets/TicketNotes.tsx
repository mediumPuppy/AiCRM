import { useState } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

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
          sortedNotes.map((note) => (
            <div key={note.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Agent #{note.sender_id}</span>
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
          ))
        )}
      </div>
    </div>
  )
} 