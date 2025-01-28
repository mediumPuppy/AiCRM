import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import * as Dialog from '@radix-ui/react-dialog'
import * as Toast from '@radix-ui/react-toast'
import { UseMutateFunction } from '@tanstack/react-query'
import { Note } from '@/api/notes'
import axios from 'axios'

interface OutreachModalProps {
  contactId: number
  open: boolean
  onClose: () => void
  onSaveNote?: UseMutateFunction<Note, Error, string>
}

type ToastVariant = 'default' | 'destructive'

interface ToastMessage {
  title: string
  description: string
  variant: ToastVariant
}

export function OutreachModal({ contactId, open, onClose, onSaveNote }: OutreachModalProps) {
  const [instruction, setInstruction] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generationCount, setGenerationCount] = useState(0)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<ToastMessage>({ 
    title: '', 
    description: '', 
    variant: 'default' 
  })

  const showToast = (title: string, description: string, variant: ToastVariant = 'default') => {
    setToastMessage({ title, description, variant })
    setToastOpen(true)
  }

  async function handleGenerate() {
    setIsLoading(true)
    const startTime = performance.now()

    try {
      const response = await axios.post('/api/ai/outreach-gpt', {
        contactId,
        instruction
      })
      setDraftMessage(response.data.draft)
      setGenerationCount(prev => prev + 1)
    } catch (error) {
      console.error('OutreachGPT failed:', error)
      showToast('Error', 'Failed to generate message. Please try again.', 'destructive')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveAsNote() {
    if (!onSaveNote || !draftMessage) return

    try {
      onSaveNote(draftMessage, {
        onSuccess: () => {
          showToast('Success', 'Message saved as note')
          onClose()
        },
        onError: (error) => {
          console.error('Failed to save note:', error)
          showToast('Error', 'Failed to save note. Please try again.', 'destructive')
        }
      })
    } catch (error) {
      console.error('Failed to save note:', error)
      showToast('Error', 'Failed to save note. Please try again.', 'destructive')
    }
  }

  function handleClose() {
    setInstruction('')
    setDraftMessage('')
    setGenerationCount(0)
    onClose()
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[600px] bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Generate Outreach Message
            </Dialog.Title>

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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Toast.Provider>
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`${
            toastMessage.variant === 'destructive' ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'
          } rounded-md p-4 fixed bottom-4 right-4 w-auto max-w-md shadow-lg`}
        >
          <Toast.Title className="font-medium">{toastMessage.title}</Toast.Title>
          <Toast.Description>{toastMessage.description}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>
    </>
  )
} 
