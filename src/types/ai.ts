export interface AIConfig {
  apiKey: string
  model: string
  baseUrl?: string
  temperature: number
  maxTokens: number
}

export interface CompletionOptions {
  prompt: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface CompletionResult {
  text: string
  finishReason: "stop" | "length" | "error"
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export type StreamCallback = (chunk: string) => void
export type ErrorCallback = (error: Error) => void
