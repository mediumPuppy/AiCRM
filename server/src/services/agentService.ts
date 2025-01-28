import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ArticleSearchTool } from "./tools/ArticleSearchTool";
import { supabase } from "../lib/supabase";
import { performance } from 'perf_hooks';
import { Langfuse } from 'langfuse';
import { ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";

// Initialize Langfuse client
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.LANGFUSE_HOST
})


interface AgentResponse {
  recommendation: string;
  metricId: number;
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

    // Create a trace for this operation
    console.log('Creating Langfuse trace...')
    const trace = langfuse.trace({
      id: `ticket-${ticketId}`,
      name: 'ActionRecommenderChain',
      metadata: {
        ticketId,
        ticket: {
          subject: ticket.subject,
          description: ticket.description
        }
      },
      input: {
        subject: ticket.subject,
        description: ticket.description || ''
      }
    })

    // 2. Initialize the agent with tools
    const model = new ChatOpenAI({
      temperature: 0,
      modelName: "gpt-4o-mini",
    });

    const tools = [
      new ArticleSearchTool(),
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "You are a helpful support agent assistant. Your goal is to help resolve customer support tickets by searching relevant documentation and providing clear, actionable recommendations."
      ),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools,
      prompt,
    });

    const executor = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
      verbose: true,
      maxIterations: 3, // Limit the number of tool calls
      returnIntermediateSteps: true, // This will help with debugging
    });

    // 3. Run the agent
    const result = await executor.invoke({
      input: `Given this support ticket with subject "${ticket.subject}" and description "${ticket.description}", 
      first search for any relevant support articles that might help, then recommend the next best action. 
      If you find relevant articles, incorporate their information into your recommendation.`
    });

    // 4. Update metrics with completion info
    const t1 = performance.now()
    const latency = Math.round(t1 - t0)
    
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
      output: result.output,
      metadata: {
        latencyMs: latency,
        metricId: newMetric.id
      }
    })

    return {
      recommendation: result.output,
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