import type * as vscode from "vscode"
import type { WebViewToExtensionMessage, ExtensionToWebViewMessage } from "./types/messages"

/**
 * Manages WebView communication and state
 */
export class WebViewManager {
  private webviews: Set<vscode.Webview> = new Set()
  private messageHandlers: Map<string, (payload: unknown) => Promise<void>> = new Map()

  constructor() {
    this.setupMessageHandlers()
  }

  registerWebview(webview: vscode.Webview) {
    this.webviews.add(webview)
  }

  async handleMessage(message: WebViewToExtensionMessage) {
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      try {
        // Only pass payload if the message has one
        const payload = "payload" in message ? (message as any).payload : undefined
        await handler(payload)
      } catch (error) {
        console.error(`Error handling message type ${message.type}:`, error)
        this.broadcastMessage({
          type: "error",
          payload: {
            code: "HANDLER_ERROR",
            message: `Failed to process ${message.type}`,
            details: { error: String(error) },
          },
        })
      }
    }
  }

  broadcastMessage(message: ExtensionToWebViewMessage) {
    this.webviews.forEach((webview) => {
      webview.postMessage(message)
    })
  }

  private setupMessageHandlers() {
    this.messageHandlers.set("ready", async () => {
      console.log("WebView is ready")
    })

    this.messageHandlers.set("chat", async (payload) => {
      console.log("Chat message received:", payload)
      // Will be handled by AI client
    })

    this.messageHandlers.set("getCompletion", async (payload) => {
      console.log("Completion request:", payload)
      // Will be handled by AI client
    })

    this.messageHandlers.set("explainCode", async (payload) => {
      console.log("Explain code request:", payload)
      // Will be handled by AI client
    })

    this.messageHandlers.set("generateTests", async (payload) => {
      console.log("Generate tests request:", payload)
      // Will be handled by AI client
    })

    this.messageHandlers.set("applyEdit", async (payload) => {
      console.log("Apply edit request:", payload)
      // Will be handled by command handler
    })
  }
}
