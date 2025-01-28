import OpenAI from 'openai'
import { observeOpenAI } from "langfuse";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateOutreachMessage(instruction: string, contactDetails: any, agentName?: string): Promise<string> {
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