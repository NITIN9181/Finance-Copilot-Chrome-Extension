/**
 * Chat Message Types
 * 
 * Types for chat interface and API communication
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string // ISO 8601
}

export interface ChatState {
  messages: ChatMessage[]
  queriesUsed: number
  queryQuota: 20
  isLoading: boolean
  error: string | null
}
