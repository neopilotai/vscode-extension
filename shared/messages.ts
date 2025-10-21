/**
 * Shared messaging schema for VS Code Extension ↔ WebView communication
 * Provides type-safe, bidirectional message passing with strict typing
 */

import type * as vscode from "vscode"
import type { Thenable } from "vscode"

/**
 * Messages sent FROM WebView TO Extension
 */
export type MessageFromWebview =
  | { type: "requestCompletion"; payload: { code: string; language: string; cursor: number } }
  | { type: "chatPrompt"; payload: { text: string } }
  | { type: "explainCode"; payload: { code: string; language: string } }
  | { type: "refactorCode"; payload: { code: string; language: string } }
  | { type: "generateTests"; payload: { code: string; language: string } }
  | { type: "applyEdit"; payload: { code: string; startLine: number; endLine: number } }
  | { type: "ready" }

/**
 * Messages sent FROM Extension TO WebView
 */
export type MessageFromExtension =
  | { type: "completionChunk"; payload: string }
  | { type: "completionEnd"; payload: null }
  | { type: "chatResponse"; payload: string }
  | { type: "error"; payload: string }
  | { type: "codeContext"; payload: { code: string; language: string; fileName: string } }
  | { type: "editApplied"; payload: { success: boolean; message: string } }

/**
 * Type guard to check if a message is from WebView
 */
export const isMessageFromWebview = (msg: unknown): msg is MessageFromWebview => {
  if (typeof msg !== "object" || msg === null) return false
  const m = msg as Record<string, unknown>
  return (
    typeof m.type === "string" &&
    ["requestCompletion", "chatPrompt", "explainCode", "refactorCode", "generateTests", "applyEdit", "ready"].includes(
      m.type as string,
    )
  )
}

/**
 * Type guard to check if a message is from Extension
 */
export const isMessageFromExtension = (msg: unknown): msg is MessageFromExtension => {
  if (typeof msg !== "object" || msg === null) return false
  const m = msg as Record<string, unknown>
  return (
    typeof m.type === "string" &&
    ["completionChunk", "completionEnd", "chatResponse", "error", "codeContext", "editApplied"].includes(
      m.type as string,
    )
  )
}

/**
 * Helper function to post a message from Extension to WebView
 * Provides type-safe message sending with validation
 */
export const postMessage = (panel: vscode.WebviewPanel, msg: MessageFromExtension): Thenable<boolean> => {
  if (!isMessageFromExtension(msg)) {
    console.error("[v0] Invalid message type:", msg)
    return Promise.resolve(false)
  }
  return panel.webview.postMessage(msg)
}

/**
 * Helper function to create a completion chunk message
 */
export const createCompletionChunk = (chunk: string): MessageFromExtension => ({
  type: "completionChunk",
  payload: chunk,
})

/**
 * Helper function to create a completion end message
 */
export const createCompletionEnd = (): MessageFromExtension => ({
  type: "completionEnd",
  payload: null,
})

/**
 * Helper function to create an error message
 */
export const createErrorMessage = (error: string | Error): MessageFromExtension => ({
  type: "error",
  payload: typeof error === "string" ? error : error.message,
})

/**
 * Helper function to create a chat response message
 */
export const createChatResponse = (response: string): MessageFromExtension => ({
  type: "chatResponse",
  payload: response,
})
