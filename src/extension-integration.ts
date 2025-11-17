import * as vscode from "vscode"
import { ExtensionManager } from "./extension-manager"
import { WebViewManager } from "./webview-manager"
import { AIService } from "./ai/ai-service"
import { SuggestionManager } from "./suggestion-manager"
import { EventHandler } from "./event-handler"
import { CommandRegistry } from "./command-registry"
import { ConfigManager } from "./config/config-manager"
import { AICodeLensProvider } from "./providers/code-lens-provider"
import { AIHoverProvider } from "./providers/hover-provider"
import { AICompletionProvider } from "./providers/completion-provider"

/**
 * Main integration class that ties all components together
 */
export class ExtensionIntegration {
  private extensionManager: ExtensionManager
  private webviewManager: WebViewManager
  private aiService: AIService
  private suggestionManager: SuggestionManager
  private eventHandler: EventHandler
  private commandRegistry: CommandRegistry
  private configManager: ConfigManager

  constructor(private context: vscode.ExtensionContext) {
    this.configManager = new ConfigManager()
    this.extensionManager = new ExtensionManager(context)
    this.webviewManager = new WebViewManager()
    this.aiService = new AIService(this.configManager.getAIConfig())
    this.suggestionManager = new SuggestionManager(this.aiService)
    this.eventHandler = new EventHandler(this.aiService, this.suggestionManager, this.extensionManager)
    this.commandRegistry = new CommandRegistry(
      this.aiService,
      this.suggestionManager,
      this.webviewManager,
      this.extensionManager,
    )
  }

  activate() {
    console.log("Activating AI Assistant extension...")

    // Register commands
    this.commandRegistry.registerCommands(this.context)

    // Register providers
    this.registerProviders()

    // Setup event listeners
    this.setupEventListeners()

    // Watch for configuration changes
    this.watchConfigurationChanges()

    console.log("AI Assistant extension activated successfully")
  }

  private registerProviders() {
    // Code Lens Provider
    const codeLensProvider = new AICodeLensProvider(this.aiService)
    this.context.subscriptions.push(vscode.languages.registerCodeLensProvider("file", codeLensProvider))

    // Hover Provider
    const hoverProvider = new AIHoverProvider(this.aiService)
    this.context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: "file" }, hoverProvider))

    // Completion Provider
    const completionProvider = new AICompletionProvider(this.aiService)
    this.context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider({ scheme: "file" }, completionProvider),
    )
  }

  private setupEventListeners() {
    // Editor change
    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
          this.eventHandler.onEditorChange(editor)
        }
      }),
    )

    // Selection change
    this.context.subscriptions.push(
      vscode.window.onDidChangeTextEditorSelection((event) => {
        this.eventHandler.onSelectionChange(event)
      }),
    )

    // Text change
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        this.eventHandler.onTextChange(event)
      }),
    )
  }

  private watchConfigurationChanges() {
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("ai-assistant")) {
          const newConfig = this.configManager.getAIConfig()
          this.aiService.updateConfig(newConfig)
          vscode.window.showInformationMessage("AI Assistant configuration updated")
        }
      }),
    )
  }

  deactivate() {
    console.log("Deactivating AI Assistant extension...")
    this.eventHandler.dispose()
    this.suggestionManager.dispose()
  }
}
