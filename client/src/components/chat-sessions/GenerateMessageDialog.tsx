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
import { IconCopy } from '@tabler/icons-react'
import axios from 'axios'

interface GenerateMessageDialogProps {
  open: boolean
  onClose: () => void
  onMessageSelect: (message: string) => void
  contactId: number
  agentName?: string
}

export function GenerateMessageDialog({ 
  open, 
  onClose,
  onMessageSelect,
  contactId,
  agentName
}: GenerateMessageDialogProps) {
  const [instruction, setInstruction] = useState('')
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!instruction.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide instructions for message generation',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await axios.post('/api/ai/outreach-gpt', {
        contactId,
        instruction: instruction.trim(),
        agentName
      })
      setGeneratedMessage(response.data.draft)
    } catch (error) {
      console.error('Failed to generate message:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate message. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (generatedMessage) {
      onMessageSelect(generatedMessage)
      onClose()
      toast({
        title: 'Success',
        description: 'Message copied to input',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Instructions</label>
            <Textarea
              placeholder="e.g., Write a friendly follow-up message asking about their experience..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !instruction.trim()}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>

          {generatedMessage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Generated Message</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8"
                >
                  <IconCopy className="h-4 w-4 mr-2" />
                  Use Message
                </Button>
              </div>
              <div className="rounded-md border p-4 bg-muted/50">
                <p className="whitespace-pre-wrap text-sm">{generatedMessage}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 