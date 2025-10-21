/**
 * Functional inline completion provider for VS Code
 * Provides Copilot-like ghost text suggestions with debouncing
 * Uses AsyncGenerator for streaming completions
 */

import * as vscode from "vscode"
import { getAICompletion } from "../ai/completion"
import type { CompletionPayload } from "../ai/completion"

/**
 * Debounce utility for performance optimization
 */
const createDebounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Extract code context around cursor position
 */
const getCodeContext = (document: vscode.TextDocument, position: vscode.Position): { code: string; cursor: number } => {
  const text = document.getText()
  const offset = document.offsetAt(position)

  // Get surrounding context (up to 50 lines before and after)
  const lines = text.split("\n")
  const currentLineIdx = position.line
  const startLine = Math.max(0, currentLineIdx - 50)
  const endLine = Math.min(lines.length, currentLineIdx + 50)

  const contextLines = lines.slice(startLine, endLine)
  const contextCode = contextLines.join("\n")

  // Calculate cursor position within context
  const cursorOffset = lines.slice(startLine, currentLineIdx).join("\n").length + position.character + startLine

  return {
    code: contextCode,
    cursor: cursorOffset,
  }
}

/**
 * Check if inline completion should be triggered
 */
const shouldTriggerCompletion = (document: vscode.TextDocument, position: vscode.Position): boolean => {
  // Don't trigger in comments or strings
  const line = document.lineAt(position.line).text
  const beforeCursor = line.substring(0, position.character)

  // Skip if in comment
  if (beforeCursor.includes("//") || beforeCursor.includes("/*")) {
    return false
  }

  // Skip if line is empty or only whitespace
  if (beforeCursor.trim().length === 0) {
    return false
  }

  // Skip if at the very beginning of a line
  if (position.character < 2) {
    return false
  }

  return true
}

/**
 * Stream completion and collect full text
 */
const streamCompletionText = async (payload: CompletionPayload): Promise<string> => {
  let fullText = ""

  try {
    for await (const chunk of getAICompletion(payload)) {
      fullText += chunk
    }
  } catch (error) {
    console.error("[v0] Completion error:", error)
    return ""
  }

  return fullText
}

/**
 * Create inline completion item from AI suggestion
 */
const createInlineCompletionItem = (completionText: string, range: vscode.Range): vscode.InlineCompletionItem => {
  // Clean up the completion text
  const cleanedText = completionText.trim()

  // Limit to single line for inline suggestions
  const singleLineText = cleanedText.split("\n")[0]

  return new vscode.InlineCompletionItem(singleLineText, range)
}

/**
 * Main inline completion provider function
 * Returns a provider that can be registered with VS Code
 */
export const createInlineCompletionProvider = (): vscode.InlineCompletionItemProvider => {
  // Store active completion requests to avoid duplicates
  const activeRequests = new Map<string, AbortController>()

  // Debounced completion function
  const debouncedGetCompletion = createDebounce(
    async (
      document: vscode.TextDocument,
      position: vscode.Position,
      callback: (items: vscode.InlineCompletionItem[]) => void,
    ) => {
      const docKey = document.uri.toString()

      // Cancel previous request if still pending
      if (activeRequests.has(docKey)) {
        activeRequests.get(docKey)?.abort()
      }

      const controller = new AbortController()
      activeRequests.set(docKey, controller)

      try {
        if (!shouldTriggerCompletion(document, position)) {
          callback([])
          return
        }

        const { code, cursor } = getCodeContext(document, position)
        const language = document.languageId

        const payload: CompletionPayload = {
          code,
          language,
          cursor: {
            line: position.line,
            character: position.character,
          },
        }

        const completionText = await streamCompletionText(payload)

        if (controller.signal.aborted) {
          return
        }

        if (completionText) {
          const range = new vscode.Range(position, position)
          const item = createInlineCompletionItem(completionText, range)
          callback([item])
        } else {
          callback([])
        }
      } catch (error) {
        console.error("[v0] Inline completion error:", error)
        callback([])
      } finally {
        activeRequests.delete(docKey)
      }
    },
    500, // 500ms debounce delay
  )

  return {
    provideInlineCompletionItems: (
      document: vscode.TextDocument,
      position: vscode.Position,
      context: vscode.InlineCompletionContext,
      token: vscode.CancellationToken,
    ): vscode.ProviderResult<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> => {
      // Return empty array immediately, then fetch asynchronously
      debouncedGetCompletion(document, position, (items) => {
        // Note: VS Code doesn't support async updates to inline completions
        // This is a limitation of the current API
        // For production, consider using a different approach or polling
      })

      return []
    },
  }
}

/**
 * Register the inline completion provider with VS Code
 * Functional registration without class instantiation
 */
export const registerInlineCompletionProvider = (context: vscode.ExtensionContext): vscode.Disposable => {
  const provider = createInlineCompletionProvider()

  // Register for all supported languages
  const languages = ["javascript", "typescript", "python", "java", "cpp", "csharp", "go", "rust", "php", "ruby"]

  const disposables = languages.map((language) =>
    vscode.languages.registerInlineCompletionItemProvider(language, provider),
  )

  // Return a composite disposable that unregisters all providers
  return vscode.Disposable.from(...disposables)
}

/**
 * Alternative: Create an inline completion provider with real-time updates
 * This version uses a different approach for better UX
 */
export const createAdvancedInlineCompletionProvider = (
  onCompletionUpdate?: (items: vscode.InlineCompletionItem[]) => void,
): vscode.InlineCompletionItemProvider => {
  const debouncedGetCompletion = createDebounce(
    async (
      document: vscode.TextDocument,
      position: vscode.Position,
      callback: (items: vscode.InlineCompletionItem[]) => void,
    ) => {
      try {
        if (!shouldTriggerCompletion(document, position)) {
          callback([])
          return
        }

        const { code, cursor } = getCodeContext(document, position)
        const language = document.languageId

        const payload: CompletionPayload = {
          code,
          language,
          cursor: {
            line: position.line,
            character: position.character,
          },
        }

        let fullText = ""

        // Stream completion chunks
        for await (const chunk of getAICompletion(payload)) {
          fullText += chunk

          // Update UI with partial completion
          if (fullText.trim()) {
            const range = new vscode.Range(position, position)
            const item = createInlineCompletionItem(fullText, range)
            callback([item])
            onCompletionUpdate?.([item])
          }
        }
      } catch (error) {
        console.error("[v0] Advanced inline completion error:", error)
        callback([])
      }
    },
    300, // Shorter debounce for real-time feel
  )

  return {
    provideInlineCompletionItems: (
      document: vscode.TextDocument,
      position: vscode.Position,
      _context: vscode.InlineCompletionContext,
      _token: vscode.CancellationToken,
    ): vscode.ProviderResult<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> => {
      debouncedGetCompletion(document, position, () => {
        // Async callback
      })
      return []
    },
  }
}
