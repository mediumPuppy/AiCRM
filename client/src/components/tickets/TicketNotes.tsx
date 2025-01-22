import { useState } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface TicketNotesProps {
  notes: string[]
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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={newNote}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
          placeholder="Add an internal note..."
          rows={4}
        />
        <Button type="submit" disabled={!newNote.trim()}>
          Add Note
        </Button>
      </form>

      <div className="space-y-4">
        {notes.map((note, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <p className="whitespace-pre-wrap">{note}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 