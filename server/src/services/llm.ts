import OpenAI from 'openai'
import { observeOpenAI } from "langfuse"
import { Langfuse } from 'langfuse'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Initialize Langfuse client
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.LANGFUSE_HOST || undefined
})

// Create an observed OpenAI client
const observedOpenAI = observeOpenAI(openai)

export async function generateOutreachMessage(instruction: string, contactDetails: any, agentName?: string): Promise<string> {
  // Create a trace for this operation
  const trace = langfuse.trace({
    name: 'GenerateOutreachMessage',
    input: {
      instruction,
      contactDetails,
      agentName
    }
  })

  const prompt = `
You are a helpful CRM assistant tasked with generating personalized outreach messages.
Using the following contact details and instruction, generate a professional and friendly message:

Contact Details:
${Object.entries(contactDetails)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

${agentName ? `Agent Name: ${agentName}` : ''}

Instruction from user:
${instruction}

Generate a message that is professional, friendly, and tailored to the contact's details.
${agentName ? `The message should be written from the perspective of ${agentName}.` : ''}
`

  // Create a span for the LLM call
  const span = trace.span({
    name: 'generate_message',
    input: {
      prompt
    }
  })

  try {
    const response = await observedOpenAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const message = response.choices[0].message.content || 'Failed to generate message'

    // Complete the span with the response
    span.end({
      output: message
    })

    // Complete the trace
    trace.update({
      output: message
    })

    return message
  } catch (error) {
    // Log error in span and trace
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    span.end({
      output: errorMessage
    })
    
    trace.update({
      output: errorMessage,
      metadata: {
        error: true,
        errorMessage
      }
    })
    
    throw error
  }
} 