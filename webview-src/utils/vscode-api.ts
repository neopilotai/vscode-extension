import type { WebViewToExtensionMessage, ExtensionToWebViewMessage } from "../../src/types/messages"
import { useWebViewStore } from "../store/webview-store"

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: unknown) => void
      setState: (state: unknown) => void
      getState: () => unknown
    }
  }
}

class VSCodeAPIClient {
  private vscode: ReturnType<typeof window.acquireVsCodeApi> | null = null

  initialize() {
    if (typeof window !== "undefined" && window.acquireVsCodeApi) {
      this.vscode = window.acquireVsCodeApi()
      this.setupMessageListener()
    }
  }

  postMessage(message: WebViewToExtensionMessage) {
    if (this.vscode) {
      this.vscode.postMessage(message)
    }
  }

  private setupMessageListener() {
    window.addEventListener("message", (event) => {
      const message = event.data as ExtensionToWebViewMessage
      this.handleMessage(message)
    })
  }

  private handleMessage(message: ExtensionToWebViewMessage) {
    const store = useWebViewStore.getState()

    switch (message.type) {
      case "chatResponse": {
        const response = message.payload
        // Only add message if it has content (not an initial empty response)
        if (response.content.trim()) {
          store.addMessage({
            id: response.id,
            role: "assistant",
            content: response.content,
            timestamp: response.timestamp,
          })
        }
        store.setLoading(false)
        break
      }

      case "streamChunk": {
        const chunk = message.payload
        // Update the streaming message in real-time
        if (chunk.id.startsWith('response-')) {
          store.updateStreamingMessage(chunk.id, chunk.chunk)
        }
        break
      }

      case "error": {
        const error = message.payload
        console.error("Error from extension:", error)
        store.setLoading(false)
        break
      }

      case "codeContext": {
        const context = message.payload
        console.log("Code context received:", context)
        break
      }

      case "editApplied": {
        const result = message.payload
        console.log("Edit applied:", result)
        break
      }

      case "completionResponse": {
        const response = message.payload
        console.log("Completions received:", response)
        break
      }
    }
  }
}

export const VSCodeAPI = new VSCodeAPIClient()
