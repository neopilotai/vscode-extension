import type { AIModelConfig, AIStreamOptions } from "../types/messages"

/**
 * Base AI client for handling different AI providers
 */
export abstract class BaseAIClient {
  protected config: AIModelConfig

  constructor(config: AIModelConfig) {
    this.config = config
  }

  abstract generateCompletion(prompt: string, options?: AIStreamOptions): Promise<string>

  abstract streamCompletion(prompt: string, options?: AIStreamOptions): AsyncGenerator<string>

  protected validateConfig() {
    if (!this.config.model) {
      throw new Error("Model not configured")
    }
  }
}

/**
 * OpenAI client implementation
 */
export class OpenAIClient extends BaseAIClient {
  private apiKey: string

  constructor(config: AIModelConfig) {
    super(config)
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || ""
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured")
    }
  }

  async generateCompletion(prompt: string, options?: AIStreamOptions): Promise<string> {
    this.validateConfig()

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: "user", content: prompt }],
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> }
    return data.choices[0].message.content
  }

  async *streamCompletion(prompt: string, options?: AIStreamOptions): AsyncGenerator<string> {
    this.validateConfig()

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: "user", content: prompt }],
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 2000,
        stream: true,
      }),
      signal: options?.signal,
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    const decoder = new TextDecoder()
    let buffer = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") {
              options?.onComplete?.()
              return
            }

            try {
              const parsed = JSON.parse(data) as {
                choices: Array<{ delta: { content?: string } }>
              }
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                options?.onChunk?.(content)
                yield content
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    } finally {
      reader.releaseLock()
    }
  }
}

/**
 * Anthropic Claude client implementation
 */
export class AnthropicClient extends BaseAIClient {
  private apiKey: string

  constructor(config: AIModelConfig) {
    super(config)
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || ""
    if (!this.apiKey) {
      throw new Error("Anthropic API key not configured")
    }
  }

  async generateCompletion(prompt: string, options?: AIStreamOptions): Promise<string> {
    this.validateConfig()

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens ?? 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = (await response.json()) as { content: Array<{ text: string }> }
    return data.content[0].text
  }

  async *streamCompletion(prompt: string, options?: AIStreamOptions): AsyncGenerator<string> {
    this.validateConfig()

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens ?? 2000,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
      signal: options?.signal,
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    const decoder = new TextDecoder()
    let buffer = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)

            try {
              const parsed = JSON.parse(data) as {
                type: string
                delta?: { type: string; text?: string }
              }

              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                options?.onChunk?.(parsed.delta.text)
                yield parsed.delta.text
              } else if (parsed.type === "message_stop") {
                options?.onComplete?.()
                return
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    } finally {
      reader.releaseLock()
    }
  }
}

/**
 * Factory for creating AI clients
 */
export class AIClientFactory {
  static create(config: AIModelConfig): BaseAIClient {
    switch (config.provider) {
      case "openai":
        return new OpenAIClient(config)
      case "anthropic":
        return new AnthropicClient(config)
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`)
    }
  }
}
