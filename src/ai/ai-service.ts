import type { ChatMessage, CodeSuggestion } from "../types/messages"
import { AIClientFactory } from "./ai-client"
import type { AIModelConfig } from "../types/messages"

/**
 * Service for handling AI operations
 */
export class AIService {
  private config: AIModelConfig
  private conversationHistory: ChatMessage[] = []

  constructor(config: AIModelConfig) {
    this.config = config
  }

  updateConfig(config: AIModelConfig) {
    this.config = config
  }

  addToHistory(message: ChatMessage) {
    this.conversationHistory.push(message)
  }

  clearHistory() {
    this.conversationHistory = []
  }

  private buildPrompt(userMessage: string): string {
    const context = this.conversationHistory
      .slice(-5) // Last 5 messages for context
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n")

    return context ? `${context}\nUser: ${userMessage}` : userMessage
  }

  async chat(userMessage: string): Promise<string> {
    const client = AIClientFactory.create(this.config)
    const prompt = this.buildPrompt(userMessage)

    return await client.generateCompletion(prompt)
  }

  async *chatStream(userMessage: string) {
    const client = AIClientFactory.create(this.config)
    const prompt = this.buildPrompt(userMessage)

    yield* client.streamCompletion(prompt)
  }

  async getCompletion(code: string, language: string): Promise<string> {
    const client = AIClientFactory.create(this.config)
    const prompt = `Complete the following ${language} code:\n\n${code}\n\nProvide only the completion without explanation.`

    return await client.generateCompletion(prompt)
  }

  async explainCode(code: string, language: string): Promise<string> {
    const client = AIClientFactory.create(this.config)
    const prompt = `Explain the following ${language} code in detail:\n\n${code}`

    return await client.generateCompletion(prompt)
  }

  async generateTests(code: string, language: string): Promise<string> {
    const client = AIClientFactory.create(this.config)
    const prompt = `Generate comprehensive unit tests for the following ${language} code:\n\n${code}\n\nProvide only the test code without explanation.`

    return await client.generateCompletion(prompt)
  }

  async generateSuggestions(code: string, language: string): Promise<CodeSuggestion[]> {
    const client = AIClientFactory.create(this.config)
    const prompt = `Analyze the following ${language} code and provide 2-3 suggestions for improvement (refactoring, optimization, or bug fixes). Format as JSON array with objects containing: type (completion|refactor|bugFix|optimization), title, description, code, startLine, endLine.\n\n${code}`

    const response = await client.generateCompletion(prompt)

    try {
      const suggestions = JSON.parse(response) as CodeSuggestion[]
      return suggestions.map((s, i) => ({
        ...s,
        id: `suggestion-${i}`,
        language,
      }))
    } catch {
      return []
    }
  }
}
