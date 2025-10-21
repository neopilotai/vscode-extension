import * as vscode from "vscode"
import type { AIService } from "./ai/ai-service"
import type { SuggestionManager } from "./suggestion-manager"
import type { ExtensionManager } from "./extension-manager"
import { ConfigManager } from "./config/config-manager"

/**
 * Handles editor events and triggers AI operations
 */
export class EventHandler {
  private configManager: ConfigManager
  private debounceTimer: NodeJS.Timeout | null = null
  private debounceDelay = 1000 // 1 second

  constructor(
    private aiService: AIService,
    private suggestionManager: SuggestionManager,
    private extensionManager: ExtensionManager,
  ) {
    this.configManager = new ConfigManager()
  }

  onEditorChange(editor: vscode.TextEditor) {
    this.extensionManager.updateActiveEditor(editor)

    if (this.configManager.getAutoSuggest()) {
      this.debounceAutoSuggest(editor)
    }
  }

  onSelectionChange(event: vscode.TextEditorSelectionChangeEvent) {
    this.extensionManager.handleSelectionChange(event)
  }

  onTextChange(event: vscode.TextDocumentChangeEvent) {
    this.extensionManager.handleTextChange(event)

    if (this.configManager.getAutoSuggest()) {
      this.debounceAutoSuggest(vscode.window.activeTextEditor)
    }
  }

  private debounceAutoSuggest(editor: vscode.TextEditor | undefined) {
    if (!editor) return

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.triggerAutoSuggest(editor)
    }, this.debounceDelay)
  }

  private async triggerAutoSuggest(editor: vscode.TextEditor) {
    if (editor.selection.isEmpty) return

    const selectedText = editor.document.getText(editor.selection)
    if (selectedText.length < 10) return // Minimum length for suggestions

    try {
      await this.suggestionManager.generateSuggestions(editor)
    } catch (error) {
      console.error("Error generating auto suggestions:", error)
    }
  }

  dispose() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  }
}
