import * as vscode from "vscode"
import type { AIService } from "../ai/ai-service"

/**
 * Provides AI-powered code completions
 */
export class AICompletionProvider implements vscode.CompletionItemProvider {
  constructor(private aiService: AIService) {}

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): Promise<vscode.CompletionItem[] | vscode.CompletionList | null> {
    // Get the current line up to the cursor
    const line = document.lineAt(position.line).text
    const linePrefix = line.substring(0, position.character)

    // Only trigger for specific patterns
    if (!this.shouldTriggerCompletion(linePrefix)) {
      return null
    }

    try {
      const completionText = await this.aiService.getCompletion(linePrefix, document.languageId)

      const item = new vscode.CompletionItem("AI Completion", vscode.CompletionItemKind.Snippet)
      item.insertText = new vscode.SnippetString(completionText)
      item.detail = "AI-generated completion"
      item.documentation = "Completion suggested by AI Assistant"
      item.sortText = "0" // Sort to top

      return [item]
    } catch (error) {
      console.error("Error generating completion:", error)
      return null
    }
  }

  private shouldTriggerCompletion(linePrefix: string): boolean {
    // Trigger after function/class definitions, comments, or specific keywords
    const triggers = [
      /function\s+\w*$/, // After 'function'
      /class\s+\w*$/, // After 'class'
      /const\s+\w+\s*=\s*$/, // After 'const x ='
      /\/\/\s*$/, // After comment
      /\{\s*$/, // After opening brace
    ]

    return triggers.some((trigger) => trigger.test(linePrefix))
  }
}
