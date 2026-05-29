/**
 * Financial Dataset Types
 * 
 * Core data models for extracted financial information
 */

import type { ChatMessage } from './chat'

export interface FinancialDataset {
  metadata: {
    sourceUrl: string
    extractedAt: string // ISO 8601 timestamp
    tableName?: string
    companyName?: string
  }

  periods: string[]

  accounts: {
    [accountLabel: string]: {
      [periodId: string]: number | null
    }
  }
}

export interface ExtractedFinancialData {
  pageTitle: string
  detectedPlatform: string
  tables: Array<{
    headers: string[]
    rows: Array<{
      label: string
      values: number[]
    }>
  }>
}

/**
 * Chrome storage schema for persistent extension data
 */
export interface StorageSchema {
  /** NVIDIA NIM API key stored in chrome.storage.local */
  nvidia_api_key: string
  /** Session state for query quota tracking */
  session_state: {
    queriesUsed: number
    lastResetTimestamp: string // ISO 8601
  }
}

/**
 * NVIDIA NIM API request payload
 */
export interface NimApiRequest {
  model: 'meta/llama-3.1-70b-instruct'
  messages: ChatMessage[]
  max_tokens: 300
  temperature: 0.3
  stream: true
}

/**
 * Streaming chunk delta from the NIM API (SSE format)
 */
export interface ChatResponseDelta {
  content?: string
}

/**
 * A single choice in a streaming chat completion chunk
 */
export interface ChatResponseChoice {
  index: number
  delta: ChatResponseDelta
  finish_reason: string | null
}

/**
 * A single Server-Sent Event chunk from the NIM API
 */
export interface ChatResponseChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: ChatResponseChoice[]
}

/**
 * Non-streaming chat completion response (used for error handling / type narrowing)
 */
export interface ChatResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Error response returned by the background worker to the content script
 */
export interface ApiErrorResponse {
  error: string
  statusCode?: number
}
