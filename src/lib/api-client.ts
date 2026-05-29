/**
 * NVIDIA NIM API Client
 * 
 * Handles API requests and streaming responses
 */

const NIM_API_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions'
const MODEL = 'meta/llama-3.1-70b-instruct'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Call NVIDIA NIM API with streaming
 */
export async function callNimApi(
  messages: ChatMessage[],
  apiKey: string
): Promise<ReadableStream> {
  const response = await fetch(NIM_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 300,
      temperature: 0.3,
      stream: true
    })
  })
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  
  return response.body!
}

/**
 * Build system prompt with financial data
 */
export function buildSystemPrompt(dataset: any): string {
  const dataStr = JSON.stringify(dataset, null, 2)
  
  return `You are a financial analysis assistant helping a user understand their ERP dashboard data.

Here is the financial data currently visible to the user:

${dataStr}

Instructions:
- Answer questions concisely and accurately based ONLY on this data
- Use specific numbers and percentages when relevant
- If the data doesn't contain the information needed, say so clearly
- Format currency values with $ and commas (e.g., $1,234,567)
- Keep responses under 200 words
- Be professional but conversational`
}
