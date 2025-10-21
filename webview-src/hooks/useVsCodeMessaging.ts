"use client"

import { useCallback, useEffect, useRef } from "react"
import type { WebViewToExtensionMessage, ExtensionToWebViewMessage } from "../../src/types/messages"

type MessageHandler = (message: ExtensionToWebViewMessage) => void

/**
 * Hook for handling bidirectional messaging with VS Code extension
 * Supports streaming responses and proper cleanup
 */
export function useVsCodeMessaging(onMessage?: MessageHandler) {
  const handlersRef = useRef<Set<MessageHandler>>(new Set())

  // Initialize VS Code API and set up message listener
  useEffect(() => {
    const vscode = (window as any).acquireVsCodeApi?.()
    if (!vscode) return

    const handleMessage = (event: MessageEvent) => {
      const message = event.data as ExtensionToWebViewMessage

      // Call provided handler
      onMessage?.(message)

      // Call all registered handlers
      handlersRef.current.forEach((handler) => handler(message))
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onMessage])

  // Post message to extension
  const postMessage = useCallback((message: WebViewToExtensionMessage) => {
    const vscode = (window as any).acquireVsCodeApi?.()
    if (vscode) {
      vscode.postMessage(message)
    }
  }, [])

  // Register additional message handler
  const addMessageHandler = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler)
    return () => handlersRef.current.delete(handler)
  }, [])

  // Stream completion with async generator pattern
  const streamCompletion = useCallback(
    async function* (payload: any) {
      const chunks: string[] = []
      let isComplete = false

      const handler: MessageHandler = (message) => {
        if (message.type === "streamChunk") {
          const chunk = message.payload
          chunks.push(chunk.chunk)
          isComplete = chunk.isComplete
        }
      }

      const unsubscribe = addMessageHandler(handler)

      try {
        // Request completion
        postMessage({
          type: "requestCompletion",
          payload,
        })

        // Yield chunks as they arrive
        while (!isComplete || chunks.length > 0) {
          if (chunks.length > 0) {
            yield chunks.shift()!
          } else if (!isComplete) {
            // Wait a bit for next chunk
            await new Promise((resolve) => setTimeout(resolve, 10))
          }
        }
      } finally {
        unsubscribe()
      }
    },
    [addMessageHandler, postMessage],
  )

  return {
    postMessage,
    addMessageHandler,
    streamCompletion,
  }
}
