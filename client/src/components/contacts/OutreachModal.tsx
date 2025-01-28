import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { UseMutateFunction } from '@tanstack/react-query'
import { Note } from '@/api/notes'
import axios from 'axios'

interface OutreachModalProps {
  contactId: number
  open: boolean
  onClose: () => void
  onSaveNote?: UseMutateFunction<Note, Error, string>
}

export function OutreachModal({ contactId, open, onClose, onSaveNote }: OutreachModalProps) {
  const [instruction, setInstruction] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generationCount, setGenerationCount] = useState(0)
  const { toast } = useToast()

  async function handleGenerate() {
    setIsLoading(true)

    try {
      const response = await axios.post('/api/ai/outreach-gpt', {
        contactId,
        instruction,
        generationCount: generationCount + 1,
        isFirstTry: generationCount === 0
      })
      setDraftMessage(response.data.draft)
      setGenerationCount(prev => prev + 1)

      console.log('Generation metrics:', response.data.metrics)
    } catch (error) {
      console.error('OutreachGPT failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate message. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveAsNote() {
    if (!onSaveNote || !draftMessage) return

    try {
      onSaveNote(draftMessage, {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Message saved as note'
          })
          onClose()
        },
        onError: (error) => {
          console.error('Failed to save note:', error)
          toast({
            title: 'Error',
            description: 'Failed to save note. Please try again.',
            variant: 'destructive'
          })
        }
      })
    } catch (error) {
      console.error('Failed to save note:', error)
      toast({
        title: 'Error',
        description: 'Failed to save note. Please try again.',
        variant: 'destructive'
      })
    }
  }

  function handleClose() {
    setInstruction('')
    setDraftMessage('')
    setGenerationCount(0)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Outreach Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Instructions
            </label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Write a welcome email for a new student..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-between">
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading || !instruction}
            >
              {isLoading ? 'Generating...' : generationCount === 0 ? 'Generate Draft' : 'Regenerate'}
            </Button>

            {onSaveNote && draftMessage && (
              <Button 
                variant="outline" 
                onClick={handleSaveAsNote}
              >
                Save as Note
              </Button>
            )}
          </div>

          {draftMessage && (
            <div className="mt-4 p-4 border rounded-md bg-muted">
              <h3 className="font-medium mb-2">Generated Draft:</h3>
              <p className="whitespace-pre-wrap">{draftMessage}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 
