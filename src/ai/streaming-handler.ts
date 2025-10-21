import type { WebViewManager } from "../webview-manager"
import type { AIService } from "./ai-service"
import type { ChatMessage } from "../types/messages"

/**
 * Handles streaming responses from AI service
 */
export class StreamingHandler {
  constructor(
    private webviewManager: WebViewManager,
    private aiService: AIService,
  ) {}

  async handleChatStream(message: ChatMessage) {
    const responseId = `response-${Date.now()}`
    let fullContent = ""

    try {
      for await (const chunk of this.aiService.chatStream(message.content)) {
        fullContent += chunk

        // Send stream chunk to WebView
        this.webviewManager.broadcastMessage({
          type: "streamChunk",
          payload: {
            id: responseId,
            chunk,
            isComplete: false,
          },
        })
      }

      // Send final response
      this.webviewManager.broadcastMessage({
        type: "chatResponse",
        payload: {
          id: responseId,
          content: fullContent,
          timestamp: Date.now(),
        },
      })

      // Add to history
      this.aiService.addToHistory({
        id: responseId,
        role: "assistant",
        content: fullContent,
        timestamp: Date.now(),
      })
    } catch (error) {
      this.webviewManager.broadcastMessage({
        type: "error",
        payload: {
          code: "STREAM_ERROR",
          message: "Failed to stream response",
          details: { error: String(error) },
        },
      })
    }
  }

  async handleCompletion(code: string, language: string) {
    try {
      const completion = await this.aiService.getCompletion(code, language)

      this.webviewManager.broadcastMessage({
        type: "completionResponse",
        payload: {
          completions: [
            {
              label: "AI Completion",
              insertText: completion,
              kind: "snippet" as const,
            },
          ],
        },
      })
    } catch (error) {
      this.webviewManager.broadcastMessage({
        type: "error",
        payload: {
          code: "COMPLETION_ERROR",
          message: "Failed to generate completion",
          details: { error: String(error) },
        },
      })
    }
  }

  async handleExplain(code: string, language: string) {
    const responseId = `explain-${Date.now()}`

    try {
      const explanation = await this.aiService.explainCode(code, language)

      this.webviewManager.broadcastMessage({
        type: "chatResponse",
        payload: {
          id: responseId,
          content: explanation,
          timestamp: Date.now(),
        },
      })
    } catch (error) {
      this.webviewManager.broadcastMessage({
        type: "error",
        payload: {
          code: "EXPLAIN_ERROR",
          message: "Failed to explain code",
          details: { error: String(error) },
        },
      })
    }
  }

  async handleGenerateTests(code: string, language: string) {
    const responseId = `tests-${Date.now()}`

    try {
      const tests = await this.aiService.generateTests(code, language)

      this.webviewManager.broadcastMessage({
        type: "chatResponse",
        payload: {
          id: responseId,
          content: tests,
          timestamp: Date.now(),
          suggestions: [
            {
              id: "test-suggestion",
              type: "snippet",
              title: "Generated Tests",
              description: "Unit tests for the selected code",
              code: tests,
              startLine: 0,
              endLine: tests.split("\n").length,
              language,
            },
          ],
        },
      })
    } catch (error) {
      this.webviewManager.broadcastMessage({
        type: "error",
        payload: {
          code: "TEST_ERROR",
          message: "Failed to generate tests",
          details: { error: String(error) },
        },
      })
    }
  }
}
