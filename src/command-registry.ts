import * as vscode from "vscode"
import type { AIService } from "./ai/ai-service"
import type { SuggestionManager } from "./suggestion-manager"
import type { WebViewManager } from "./webview-manager"
import type { ExtensionManager } from "./extension-manager"
import { StreamingHandler } from "./ai/streaming-handler"

/**
 * Registers and handles all extension commands
 */
export class CommandRegistry {
  private streamingHandler: StreamingHandler

  constructor(
    private _aiService: AIService,
    private suggestionManager: SuggestionManager,
    private _webviewManager: WebViewManager,
    private _extensionManager: ExtensionManager,
  ) {
    this.streamingHandler = new StreamingHandler(webviewManager, aiService)
  }

  registerCommands(context: vscode.ExtensionContext) {
    // Open Chat command
    context.subscriptions.push(vscode.commands.registerCommand("ai-assistant.openChat", () => this.openChat()))

    // Get Completion command
    context.subscriptions.push(
      vscode.commands.registerCommand("ai-assistant.getCompletion", () => this.getCompletion()),
    )

    // Explain Code command
    context.subscriptions.push(
      vscode.commands.registerCommand("ai-assistant.explainCode", (uri?: vscode.Uri, range?: vscode.Range) =>
        this.explainCode(uri, range),
      ),
    )

    // Generate Tests command
    context.subscriptions.push(
      vscode.commands.registerCommand("ai-assistant.generateTests", (uri?: vscode.Uri, range?: vscode.Range) =>
        this.generateTests(uri, range),
      ),
    )

    // Get Suggestions command
    context.subscriptions.push(
      vscode.commands.registerCommand("ai-assistant.getSuggestions", (uri?: vscode.Uri, range?: vscode.Range) =>
        this.getSuggestions(uri, range),
      ),
    )

    // Apply Suggestion command
    context.subscriptions.push(
      vscode.commands.registerCommand("ai-assistant.applySuggestion", (suggestionId: string) =>
        this.applySuggestion(suggestionId),
      ),
    )

    // Clear Suggestions command
    context.subscriptions.push(
      vscode.commands.registerCommand("ai-assistant.clearSuggestions", () => this.clearSuggestions()),
    )

    // Configure API Key command
    context.subscriptions.push(
      vscode.commands.registerCommand("ai-assistant.configureApiKey", () => this.configureApiKey()),
    )

    // Toggle Auto Suggest command
    context.subscriptions.push(
      vscode.commands.registerCommand("ai-assistant.toggleAutoSuggest", () => this.toggleAutoSuggest()),
    )
  }

  private async openChat() {
    vscode.commands.executeCommand("ai-assistant-chat.focus")
  }

  private async getCompletion() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    const selectedText = editor.document.getText(editor.selection)
    if (!selectedText) {
      vscode.window.showErrorMessage("Please select code to complete")
      return
    }

    try {
      await this.streamingHandler.handleCompletion(selectedText, editor.document.languageId)
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get completion: ${String(error)}`)
    }
  }

  private async explainCode(_uri?: vscode.Uri, _range?: vscode.Range) {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    const selectedText = editor.document.getText(editor.selection)
    if (!selectedText) {
      vscode.window.showErrorMessage("Please select code to explain")
      return
    }

    try {
      await this.streamingHandler.handleExplain(selectedText, editor.document.languageId)
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to explain code: ${String(error)}`)
    }
  }

  private async generateTests(_uri?: vscode.Uri, _range?: vscode.Range) {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    const selectedText = editor.document.getText(editor.selection)
    if (!selectedText) {
      vscode.window.showErrorMessage("Please select code to generate tests for")
      return
    }

    try {
      await this.streamingHandler.handleGenerateTests(selectedText, editor.document.languageId)
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to generate tests: ${String(error)}`)
    }
  }

  private async getSuggestions(_uri?: vscode.Uri, _range?: vscode.Range) {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    try {
      const suggestions = await this.suggestionManager.generateSuggestions(editor)
      if (suggestions.length === 0) {
        vscode.window.showInformationMessage("No suggestions available")
      } else {
        vscode.window.showInformationMessage(`Generated ${suggestions.length} suggestion(s)`)
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get suggestions: ${String(error)}`)
    }
  }

  private async applySuggestion(suggestionId: string) {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    try {
      await this.suggestionManager.applySuggestion(editor, suggestionId)
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to apply suggestion: ${String(error)}`)
    }
  }

  private clearSuggestions() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    this.suggestionManager.clearSuggestions(editor)
    vscode.window.showInformationMessage("Suggestions cleared")
  }

  private async configureApiKey() {
    const provider = await vscode.window.showQuickPick(["OpenAI", "Anthropic"], {
      placeHolder: "Select AI provider",
    })

    if (!provider) return

    const apiKey = await vscode.window.showInputBox({
      prompt: `Enter your ${provider} API key`,
      password: true,
      ignoreFocusOut: true,
    })

    if (apiKey) {
      await vscode.workspace
        .getConfiguration("ai-assistant")
        .update("apiKey", apiKey, vscode.ConfigurationTarget.Global)
      vscode.window.showInformationMessage(`${provider} API key configured`)
    }
  }

  private async toggleAutoSuggest() {
    const config = vscode.workspace.getConfiguration("ai-assistant")
    const current = config.get("autoSuggest") as boolean
    await config.update("autoSuggest", !current, vscode.ConfigurationTarget.Global)
    vscode.window.showInformationMessage(`Auto suggest ${!current ? "enabled" : "disabled"}`)
  }
}
