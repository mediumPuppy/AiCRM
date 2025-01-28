import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateOutreachMessage(instruction: string, contactDetails: any): Promise<string> {
  const prompt = `
You are a helpful CRM assistant tasked with generating personalized outreach messages.
Using the following contact details and instruction, generate a professional and friendly message:

Contact Details:
${Object.entries(contactDetails)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

Instruction from user:
${instruction}

Generate a message that is professional, friendly, and tailored to the contact's details.
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
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