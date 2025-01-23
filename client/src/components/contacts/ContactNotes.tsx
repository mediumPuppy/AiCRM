import { useState } from 'react';
import { Button } from '../ui/button';
import { Note } from '@/api/notes';
import { UseMutateFunction } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { formatDate } from '../../utils/formatDate';

interface ContactNotesProps {
  notes: Note[];
  onAddNote: UseMutateFunction<Note, Error, string, unknown>;
  isLoading?: boolean;
}

export function ContactNotes({ notes, onAddNote, isLoading }: ContactNotesProps) {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      onAddNote(newNote);
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const formatMessageDate = (date: string) => {
    return formatDate(date, { includeTime: true, includeYear: false });
  };

  // Sort notes by created_at in descending order (newest first)
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Progress value={33} className="w-[60%]" />
        <span className="text-sm text-muted-foreground">Loading notes...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          rows={3}
          placeholder="Add an internal note..."
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" disabled={!newNote.trim()}>
            Add Note
          </Button>
        </div>
      </form>

      <div className="space-y-6 min-h-0">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notes available
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div key={note.id} className="flex gap-4 flex-row-reverse">
              <Avatar className="flex-shrink-0 w-10 h-10">
                <AvatarFallback>
                  {note.user_id.toString()[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 rounded-lg p-4 border bg-white ml-16">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    Agent #{note.user_id}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatMessageDate(note.created_at)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{note.note}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 