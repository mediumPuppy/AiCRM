import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { supabase } from '@/lib/supabase'
import { performance } from 'perf_hooks'
import { Langfuse } from 'langfuse'

// Initialize Langfuse client
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.LANGFUSE_HOST
})
console.log('Langfuse initialized with:', {
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST
})

interface AgentResponse {
  recommendation: string
  metricId: number
}

export async function runAgentOnTicket(ticketId: number): Promise<AgentResponse> {
  console.log('Starting runAgentOnTicket with ticketId:', ticketId)
  const t0 = performance.now()
  
  try {
    // Insert row in 'agent_metrics' with partial info
    console.log('Creating agent_metrics entry...')
    const startTime = new Date()
    const { data: newMetric, error: metricError } = await supabase
      .from('agent_metrics')
      .insert({
        agent_name: 'ActionRecommender',
        ticket_id: ticketId,
        start_time: startTime
      })
      .select()
      .single()

    if (metricError) {
      console.error('Failed to create metric:', metricError)
      throw new Error('Failed to create metric')
    }
    console.log('Created agent_metrics entry:', newMetric)

    // Create a trace for this operation
    console.log('Creating Langfuse trace...')
    const trace = langfuse.trace({
      id: `ticket-${ticketId}`,
      name: 'ActionRecommenderChain',
      metadata: {
        ticketId,
      },
    })

    // 1. Fetch the ticket from supabase
    console.log('Fetching ticket details...')
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (error) {
      console.error('Failed to fetch ticket:', error)
      throw error
    }
    if (!ticket) {
      console.error('Ticket not found for id:', ticketId)
      throw new Error('Ticket not found')
    }
    console.log('Found ticket:', { id: ticket.id, subject: ticket.subject })

    // 2. Use a template or chain
    console.log('Initializing ChatOpenAI...')
    const model = new ChatOpenAI({
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY
    })

    console.log('Creating prompt template...')
    const prompt = new PromptTemplate({
      template: `
        You are an AI assistant. You have ticket details:
        Subject: {subject}
        Description: {description}

        Suggest the next best action to take on this ticket. 
        Return a short text with your recommendation.
      `,
      inputVariables: ['subject', 'description']
    })

    // Create a chain using RunnableSequence
    console.log('Creating RunnableSequence...')
    const chain = RunnableSequence.from([prompt, model])

    // 3. Run the chain
    console.log('Running chain with inputs:', {
      subject: ticket.subject,
      description: ticket.description || ''
    })
    const response = await chain.invoke({
      subject: ticket.subject,
      description: ticket.description || ''
    })
    console.log('Got response from chain:', response)

    const t1 = performance.now()
    const latency = Math.round(t1 - t0)

    // Extract the content from the AIMessage and ensure it's a string
    const recommendation = String(typeof response === 'string' ? response : response.content)

    // Update metrics
    console.log('Updating metrics with latency:', latency)
    await supabase
      .from('agent_metrics')
      .update({
        end_time: new Date(),
        latency_ms: latency
      })
      .eq('id', newMetric.id)

    // Complete the trace
    console.log('Updating Langfuse trace...')
    trace.update({
      metadata: {
        output: recommendation,
        latencyMs: latency
      }
    })

    return {
      recommendation,
      metricId: newMetric.id
    }
  } catch (error) {
    console.error('Error in runAgentOnTicket:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    throw error
  }
} 