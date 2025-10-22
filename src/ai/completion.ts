/**
 * Completion request payload
 */
export interface CompletionPayload {
  code: string
  language: string
  cursor: {
    line: number
    character: number
  }
}

/**
 * Configuration for completion service
 */
interface CompletionConfig {
  provider: "openai" | "local"
  apiKey?: string
  model: string
  baseUrl?: string
  temperature: number
  maxTokens: number
  enableTokenCounting: boolean
  enableSafetyFilter: boolean
  maxRetries: number
  retryDelay: number
}
const getConfig = (): CompletionConfig => ({
  provider: (process.env.AI_PROVIDER as "openai" | "local") || "openai",
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
  model: process.env.AI_MODEL || "gpt-4-turbo",
  baseUrl: process.env.AI_BASE_URL,
  temperature: Number.parseFloat(process.env.AI_TEMPERATURE || "0.7"),
  maxTokens: Number.parseInt(process.env.AI_MAX_TOKENS || "2048", 10),
  enableTokenCounting: process.env.AI_ENABLE_TOKEN_COUNTING !== "false",
  enableSafetyFilter: process.env.AI_ENABLE_SAFETY_FILTER !== "false",
  maxRetries: Number.parseInt(process.env.AI_MAX_RETRIES || "3", 10),
  retryDelay: Number.parseInt(process.env.AI_RETRY_DELAY || "1000", 10),
})

/**
 * Simple token estimation (1 token ≈ 4 characters for English text)
 * For production, consider using js-tiktoken for more accurate counting
 */
const estimateTokenCount = (text: string): number => {
  // Remove extra whitespace and count words
  const words = text.trim().split(/\s+/).length
  const chars = text.length

  // Estimate: ~4 characters per token, plus 20% for subword tokens
  return Math.ceil((chars / 4) * 1.2 + words * 0.1)
}

/**
 * Enhanced safety filter for code content
 */
const isSafeContent = (content: string): boolean => {
  const harmfulPatterns = [
    // Security vulnerabilities
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
    /shell_exec\s*\(/i,
    /popen\s*\(/i,
    /proc_open\s*\(/i,

    // Network attacks
    /sql.*injection/i,
    /xss.*attack/i,
    /csrf.*attack/i,
    /rfi.*attack/i,
    /lfi.*attack/i,

    // Malware indicators
    /malware/i,
    /ransomware/i,
    /trojan/i,
    /backdoor/i,
    /exploit/i,
    /vulnerability.*attack/i,

    // File system dangers
    /rm\s+-rf/i,
    /del\s+.*\*.*\*/i,
    /format\s+/i,
    /fdisk/i,
    /mkfs/i,

    // Network dangers
    /wget.*\|\s*sh/i,
    /curl.*\|\s*sh/i,
    /nc\s+-l/i,
    /netcat.*listen/i,

    // Code injection
    /innerHTML\s*=\s*.*\+/i,
    /outerHTML\s*=\s*.*\+/i,
    /insertAdjacentHTML/i,
    /document\.write/i,
    /eval\s*\(/i,
    /Function\s*\(/i,
    /setTimeout.*string/i,
    /setInterval.*string/i,
  ]

  return !harmfulPatterns.some((pattern) => pattern.test(content))
}

/**
 * Check if language is supported
 */
const isSupportedLanguage = (language: string): boolean => {
  const supportedLanguages = [
    "javascript", "typescript", "python", "java", "cpp", "csharp", "c",
    "go", "rust", "php", "ruby", "swift", "kotlin", "scala", "r", "sql",
    "html", "css", "json", "xml", "yaml", "toml", "ini", "sh", "bash",
    "powershell", "dockerfile", "makefile", "markdown", "latex"
  ]
  return supportedLanguages.includes(language.toLowerCase())
}

/**
 * Build completion prompt with code context
 */
const buildCompletionPrompt = (payload: CompletionPayload): string => {
  const { code, language, cursor } = payload
  const lines = code.split("\n")
  const currentLine = lines[cursor.line] || ""
  const beforeCursor = currentLine.substring(0, cursor.character)
  const afterCursor = currentLine.substring(cursor.character)

  // Get context lines (10 before and 5 after for better context)
  const startLine = Math.max(0, cursor.line - 10)
  const endLine = Math.min(lines.length, cursor.line + 5)
  const contextLines = lines.slice(startLine, endLine)

  const contextCode = contextLines
    .map((line, idx) => {
      const lineNum = startLine + idx
      const marker = lineNum === cursor.line ? ">>> " : "    "
      return `${marker}${line}`
    })
    .join("\n")

  const languageDisplay = language.charAt(0).toUpperCase() + language.slice(1)

  return `Complete the following ${languageDisplay} code. The cursor (>>> ) indicates where the completion should be inserted:

\`\`\`${language}
${contextCode}
\`\`\`

Context:
- Current line before cursor: "${beforeCursor}"
- Current line after cursor: "${afterCursor}"
- File appears to be ${languageDisplay} code

Requirements:
- Provide only the code completion that should be inserted at the cursor position
- Do not include any explanation, comments, or markdown formatting
- Match the indentation and style of the existing code
- Complete the current statement or block appropriately
- If completing a function call, include proper closing parentheses
- If completing a statement, include proper semicolon or closing bracket if needed

Completion:`
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Stream completion from OpenAI API with retry logic
 */
async function* streamOpenAICompletion(prompt: string, config: CompletionConfig): AsyncGenerator<string> {
  if (!config.apiKey) {
    throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY environment variable or ai-assistant.apiKey in VSCode settings.")
  }

  const url = `${config.baseUrl || "https://api.openai.com/v1"}/chat/completions`
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: prompt }],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        const error = new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)

        // Don't retry on authentication errors
        if (response.status === 401 || response.status === 403) {
          throw error
        }

        lastError = error
        if (attempt < config.maxRetries) {
          await sleep(config.retryDelay * attempt)
          continue
        }
        throw error
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body from OpenAI API")
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
              const data = line.slice(6).trim()
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                const chunk = parsed.choices?.[0]?.delta?.content || ""
                if (chunk) {
                  yield chunk
                }
              } catch {
                // Skip invalid JSON lines (keepalive, etc.)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      // Success, break out of retry loop
      return

    } catch (error) {
      lastError = error as Error

      if (attempt < config.maxRetries) {
        console.warn(`OpenAI completion attempt ${attempt} failed:`, error)
        await sleep(config.retryDelay * attempt)
        continue
      }
    }
  }

  throw lastError || new Error("All retry attempts failed")
}

/**
 * Stream completion from local HTTP endpoint with retry logic
 */
async function* streamLocalCompletion(prompt: string, config: CompletionConfig): AsyncGenerator<string> {
  const baseUrl = config.baseUrl || "http://localhost:8000"
  const url = `${baseUrl}/v1/chat/completions`
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: prompt }],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        const error = new Error(`Local API error: ${response.status} ${response.statusText} - ${errorText}`)

        // Don't retry on authentication errors
        if (response.status === 401 || response.status === 403) {
          throw error
        }

        lastError = error
        if (attempt < config.maxRetries) {
          await sleep(config.retryDelay * attempt)
          continue
        }
        throw error
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body from local API")
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
              const data = line.slice(6).trim()
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                const chunk = parsed.choices?.[0]?.delta?.content || ""
                if (chunk) {
                  yield chunk
                }
              } catch {
                // Skip invalid JSON lines (keepalive, etc.)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      // Success, break out of retry loop
      return

    } catch (error) {
      lastError = error as Error

      if (attempt < config.maxRetries) {
        console.warn(`Local completion attempt ${attempt} failed:`, error)
        await sleep(config.retryDelay * attempt)
        continue
      }
    }
  }

  throw lastError || new Error("All retry attempts failed")
}

/**
 * Main completion function that returns an AsyncGenerator
 *
 * Usage:
 *   for await (const chunk of getAICompletion({ code, language, cursor })) {
 *     console.log(chunk)
 *   }
 *
 * @param payload - Completion request with code, language, and cursor position
 * @returns AsyncGenerator yielding completion chunks as strings
 */
export async function* getAICompletion(payload: CompletionPayload): AsyncGenerator<string> {
  const config = getConfig()

  // Validate language support
  if (!isSupportedLanguage(payload.language)) {
    throw new Error(`Unsupported language: ${payload.language}. Supported languages include JavaScript, TypeScript, Python, Java, C++, and many others.`)
  }

  const prompt = buildCompletionPrompt(payload)
  const promptTokens = config.enableTokenCounting ? estimateTokenCount(prompt) : 0

  // Check token limits
  if (config.enableTokenCounting && promptTokens > config.maxTokens) {
    throw new Error(`Prompt too large: ${promptTokens} estimated tokens exceeds maximum of ${config.maxTokens}. Try reducing code context or increasing AI_MAX_TOKENS.`)
  }

  // Safety check
  if (config.enableSafetyFilter && !isSafeContent(payload.code)) {
    throw new Error("Code content contains potentially unsafe patterns. Completion blocked for security.")
  }

  try {
    if (config.provider === "openai") {
      yield* streamOpenAICompletion(prompt, config)
    } else if (config.provider === "local") {
      yield* streamLocalCompletion(prompt, config)
    } else {
      throw new Error(`Unsupported AI provider: ${config.provider}. Supported providers: openai, local.`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`AI completion failed: ${message}`)
  }
}

/**
 * Get full completion as a string (non-streaming)
 * Convenience function that collects all chunks into a single string
 */
export const getAICompletionFull = async (payload: CompletionPayload): Promise<string> => {
  let result = ""
  for await (const chunk of getAICompletion(payload)) {
    result += chunk
  }
  return result.trim()
}

/**
 * Get estimated token count for a given text
 * Useful for checking if content fits within model limits
 */
export const getTokenCount = (text: string): number => {
  return estimateTokenCount(text)
}

/**
 * Validate content against safety filters
 * Returns true if content passes all safety checks
 */
export const validateContent = (content: string): boolean => {
  return isSafeContent(content)
}

/**
 * Check if a language is supported by the completion system
 */
export const isLanguageSupported = (language: string): boolean => {
  return isSupportedLanguage(language)
}

/**
 * Update configuration at runtime
 * Useful for VSCode settings changes
 */
export const updateCompletionConfig = (overrides: Partial<CompletionConfig>): void => {
  // Note: This updates the module-level config
  // For full runtime updates, consider using a config store
  const currentConfig = getConfig()
  Object.assign(currentConfig, overrides)
}

/**
 * Get current configuration (without sensitive data)
 */
export const getCompletionConfig = (): Omit<CompletionConfig, 'apiKey'> => {
  const config = getConfig()
  const { apiKey, ...safeConfig } = config
  return safeConfig
}
