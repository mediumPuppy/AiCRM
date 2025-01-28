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

export async function generateChatMessage(instruction: string, contactDetails: any, agentName?: string): Promise<string> {
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

  const response = await openai.chat.completions.create({
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

  return response.choices[0].message.content || 'Failed to generate message'
}

export async function generateArticleAwareMessage(instruction: string, contactDetails: any, agentName?: string): Promise<string> {
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
You are a customer support AI assistant. Your responses here are for a customer support agent helping a customer. Format your responses in markdown using this exact structure:

**Recommendation:** [One clear action to take]

**Key Points:**
• [First key point]
• [Second key point]
• [Third key point]

**Supporting Info:** [Brief context or relevant article if applicable]

Rules:
- Lead with the most important action to take
- Keep points brief and actionable
- Use bullet points for clarity
- Limit to 3 key points
- If an article has LIMITED content, acknowledge the limitation
- If article content is too brief, use it directly and note more info is needed
- Never imply article content that isn't present
- Never suggest following steps or guides that aren't explicitly in the content
- Be transparent about limited information
- Keep all sections brief and focused
- Maintain exact markdown formatting
- NEVER ask questions
- Never suggest contacting support. You are the support agent.

Example with limited article:
If article only contains "Welcome to our service", respond like:
**Recommendation:** Gather more detailed information about service features
**Key Points:**
• Found welcome article but content is limited
• Additional documentation needed
**Supporting Info:** Article only contains basic welcome message: "Welcome to our service"

Contact Details:
${Object.entries(contactDetails)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

${agentName ? `Agent Name: ${agentName}` : ''}

Instruction from user:
${instruction}

Remember to maintain the exact format specified above.
${agentName ? `Respond from ${agentName}'s perspective.` : ''}`

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