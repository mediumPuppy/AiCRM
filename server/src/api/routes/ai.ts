import { Router, Request, Response, RequestHandler } from 'express'
import { generateOutreachMessage } from '../../services/llm'
import { supabase } from '../../lib/supabase'

const router = Router()

const generateOutreachDraft: RequestHandler = async (req, res) => {
  try {
    const { 
      contactId, 
      instruction,
      generationCount = 1,
      isFirstTry = true
    } = req.body

    if (!contactId || !instruction) {
      res.status(400).json({ error: 'Missing required fields: contactId and instruction' })
      return
    }

    // Fetch contact details
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single()

    if (contactError || !contactData) {
      res.status(404).json({ error: 'Contact not found' })
      return
    }

    // Generate the message
    const startTime = performance.now()
    const draftMessage = await generateOutreachMessage(instruction, contactData)
    const endTime = performance.now()
    const generationTime = endTime - startTime

    // Log metrics
    await supabase.from('outreach_metrics').insert({
      contact_id: contactId,
      generation_time_ms: generationTime,
      instruction,
      total_generations: generationCount,
      accepted_on_first_try: isFirstTry,
      created_at: new Date().toISOString()
    })

    res.json({ 
      draft: draftMessage,
      metrics: {
        generationTime,
        generationCount
      }
    })
  } catch (error) {
    console.error('OutreachGPT error:', error)
    res.status(500).json({ error: 'Failed to generate outreach message' })
  }
}

router.post('/outreach-gpt', generateOutreachDraft)

export default router 
