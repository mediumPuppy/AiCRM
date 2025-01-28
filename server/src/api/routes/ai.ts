import { Router, Request, Response } from 'express'
import { generateOutreachMessage } from '../../services/llm'
import { supabase } from '../../lib/supabase'

const router = Router()

router.post('/outreach-gpt', async (req: Request, res: Response) => {
  try {
    const { contactId, instruction } = req.body

    if (!contactId || !instruction) {
      return res.status(400).json({ error: 'Missing required fields: contactId and instruction' })
    }

    // Fetch contact details
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single()

    if (contactError || !contactData) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    // Generate the message
    const startTime = performance.now()
    const draftMessage = await generateOutreachMessage(instruction, contactData)
    const endTime = performance.now()

    // Log metrics
    await supabase.from('outreach_metrics').insert({
      contact_id: contactId,
      generation_time_ms: endTime - startTime,
      instruction,
      created_at: new Date().toISOString()
    })

    return res.json({ draft: draftMessage })
  } catch (error) {
    console.error('OutreachGPT error:', error)
    return res.status(500).json({ error: 'Failed to generate outreach message' })
  }
})

export default router 
