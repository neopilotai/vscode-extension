/**
 * Shared message types for communication between VS Code extension and WebView
 */

// Message types sent from WebView to Extension
export type WebViewToExtensionMessage =
  | { type: "chat"; payload: ChatMessage }
  | { type: "getCompletion"; payload: CompletionRequest }
  | { type: "explainCode"; payload: CodeContextRequest }
  | { type: "generateTests"; payload: CodeContextRequest }
  | { type: "applyEdit"; payload: ApplyEditRequest }
  | { type: "ready" }

// Message types sent from Extension to WebView
export type ExtensionToWebViewMessage =
  | { type: "chatResponse"; payload: ChatResponse }
  | { type: "completionResponse"; payload: CompletionResponse }
  | { type: "streamChunk"; payload: StreamChunk }
  | { type: "error"; payload: ErrorResponse }
  | { type: "codeContext"; payload: CodeContext }
  | { type: "editApplied"; payload: EditResult }

// Chat-related types
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  codeContext?: CodeContext
}

export interface ChatResponse {
  id: string
  content: string
  timestamp: number
  suggestions?: CodeSuggestion[]
}

// Streaming types
export interface StreamChunk {
  id: string
  chunk: string
  isComplete: boolean
}

// Completion types
export interface CompletionRequest {
  position: {
    line: number
    character: number
  }
  language: string
  context: string
}

export interface CompletionResponse {
  completions: Completion[]
  selectedIndex?: number
}

export interface Completion {
  label: string
  detail?: string
  documentation?: string
  insertText: string
  kind: "function" | "variable" | "class" | "interface" | "snippet" | "keyword"
}

// Code context types
export interface CodeContextRequest {
  selectedText: string
  fileName: string
  language: string
  lineNumber: number
}

export interface CodeContext {
  selectedText: string
  fileName: string
  language: string
  lineNumber: number
  fullContent?: string
}

// Code suggestion types
export interface CodeSuggestion {
  id: string
  type: "completion" | "refactor" | "bugFix" | "optimization"
  title: string
  description: string
  code: string
  startLine: number
  endLine: number
  language: string
}

// Edit types
export interface ApplyEditRequest {
  suggestionId: string
  startLine: number
  endLine: number
  newCode: string
  fileName: string
}

export interface EditResult {
  success: boolean
  message: string
  fileName: string
  appliedLines: {
    start: number
    end: number
  }
}

// Error types
export interface ErrorResponse {
  code: string
  message: string
  details?: Record<string, unknown>
}

// AI Model types
export interface AIModelConfig {
  provider: "openai" | "anthropic" | "groq" | "local"
  model: string
  apiKey?: string
  temperature?: number
  maxTokens?: number
}

export interface AIStreamOptions {
  onChunk?: (chunk: string) => void
  onComplete?: () => void
  onError?: (error: Error) => void
  signal?: AbortSignal
}
