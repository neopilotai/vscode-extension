import type { AIConfig, CompletionOptions, CompletionResult, StreamCallback, ErrorCallback } from "../types/ai"

export const createOpenAIClient = (config: AIConfig) => {
  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  }

  const generateCompletion = async (options: CompletionOptions): Promise<CompletionResult> => {
    const response = await fetch(`${config.baseUrl || "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: options.prompt }],
        temperature: options.temperature ?? config.temperature,
        max_tokens: options.maxTokens ?? config.maxTokens,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string }; finish_reason: string }>; usage: unknown }
    return {
      text: data.choices[0].message.content,
      finishReason: data.choices[0].finish_reason,
      usage: data.usage,
    }
  }

  const streamCompletion = async (
    options: CompletionOptions,
    onChunk: StreamCallback,
    onError: ErrorCallback,
  ): Promise<void> => {
    try {
      const response = await fetch(`${config.baseUrl || "https://api.openai.com/v1"}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: options.prompt }],
          temperature: options.temperature ?? config.temperature,
          max_tokens: options.maxTokens ?? config.maxTokens,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              const chunk = parsed.choices[0]?.delta?.content || ""
              if (chunk) onChunk(chunk)
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  return { generateCompletion, streamCompletion }
}
