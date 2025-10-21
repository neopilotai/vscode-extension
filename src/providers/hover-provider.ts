import * as vscode from "vscode"
import type { AIService } from "../ai/ai-service"

/**
 * Provides hover information with AI insights
 */
export class AIHoverProvider implements vscode.HoverProvider {
  constructor(private aiService: AIService) {}

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): Promise<vscode.Hover | null> {
    const range = document.getWordRangeAtPosition(position)
    if (!range) return null

    const word = document.getText(range)
    const line = document.lineAt(position.line).text

    // Only show hover for code-like words
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(word)) {
      return null
    }

    // Get context around the word
    const startLine = Math.max(0, position.line - 5)
    const endLine = Math.min(document.lineCount, position.line + 5)
    const context = document.getText(new vscode.Range(startLine, 0, endLine, 0))

    const markdown = new vscode.MarkdownString()
    markdown.appendMarkdown(`**${word}**\n\n`)
    markdown.appendMarkdown("*AI Assistant*\n\n")
    markdown.appendMarkdown("Hover over code to see AI insights. Click code lenses for more options.")

    return new vscode.Hover(markdown, range)
  }
}
