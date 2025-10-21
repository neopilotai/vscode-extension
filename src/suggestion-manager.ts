import * as vscode from "vscode"
import type { CodeSuggestion } from "./types/messages"
import { DecoratorManager } from "./decorations/decorator-manager"
import type { AIService } from "./ai/ai-service"

/**
 * Manages code suggestions and their application
 */
export class SuggestionManager {
  private suggestions: Map<string, CodeSuggestion> = new Map()
  private decoratorManager: DecoratorManager

  constructor(private aiService: AIService) {
    this.decoratorManager = new DecoratorManager()
  }

  async generateSuggestions(editor: vscode.TextEditor): Promise<CodeSuggestion[]> {
    const document = editor.document
    const selectedText = editor.document.getText(editor.selection)

    if (!selectedText) {
      vscode.window.showWarningMessage("Please select code to get suggestions")
      return []
    }

    try {
      const suggestions = await this.aiService.generateSuggestions(selectedText, document.languageId)

      // Store suggestions
      suggestions.forEach((suggestion) => {
        this.suggestions.set(suggestion.id, suggestion)
        this.decoratorManager.addSuggestion(editor, suggestion)
      })

      return suggestions
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to generate suggestions: ${String(error)}`)
      return []
    }
  }

  async applySuggestion(editor: vscode.TextEditor, suggestionId: string): Promise<boolean> {
    const suggestion = this.suggestions.get(suggestionId)
    if (!suggestion) {
      vscode.window.showErrorMessage("Suggestion not found")
      return false
    }

    try {
      const startPos = new vscode.Position(suggestion.startLine, 0)
      const endPos = new vscode.Position(suggestion.endLine + 1, 0)
      const range = new vscode.Range(startPos, endPos)

      const success = await editor.edit((editBuilder) => {
        editBuilder.replace(range, suggestion.code + "\n")
      })

      if (success) {
        this.decoratorManager.removeSuggestion(editor, suggestionId)
        this.suggestions.delete(suggestionId)
        vscode.window.showInformationMessage("Suggestion applied successfully")
      }

      return success
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to apply suggestion: ${String(error)}`)
      return false
    }
  }

  clearSuggestions(editor: vscode.TextEditor) {
    this.decoratorManager.clearAll(editor)
    this.suggestions.clear()
  }

  dispose() {
    this.decoratorManager.dispose()
  }
}
