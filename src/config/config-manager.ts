import * as vscode from "vscode"
import type { AIModelConfig } from "../types/messages"

/**
 * Manages extension configuration
 */
export class ConfigManager {
  private config: vscode.WorkspaceConfiguration

  constructor() {
    this.config = vscode.workspace.getConfiguration("ai-assistant")
  }

  getAIConfig(): AIModelConfig {
    return {
      provider: (this.config.get("provider") as "openai" | "anthropic") || "openai",
      model: this.config.get("model") || "gpt-4",
      apiKey: this.config.get("apiKey") || process.env.OPENAI_API_KEY,
      temperature: this.config.get("temperature") || 0.7,
      maxTokens: this.config.get("maxTokens") || 2000,
    }
  }

  setAIConfig(config: Partial<AIModelConfig>) {
    if (config.provider) {
      this.config.update("provider", config.provider, vscode.ConfigurationTarget.Global)
    }
    if (config.model) {
      this.config.update("model", config.model, vscode.ConfigurationTarget.Global)
    }
    if (config.temperature !== undefined) {
      this.config.update("temperature", config.temperature, vscode.ConfigurationTarget.Global)
    }
    if (config.maxTokens !== undefined) {
      this.config.update("maxTokens", config.maxTokens, vscode.ConfigurationTarget.Global)
    }
  }

  getAutoSuggest(): boolean {
    return this.config.get("autoSuggest") || false
  }

  setAutoSuggest(enabled: boolean) {
    this.config.update("autoSuggest", enabled, vscode.ConfigurationTarget.Global)
  }

  getLanguages(): string[] {
    return this.config.get("supportedLanguages") || ["typescript", "javascript", "python", "java", "cpp"]
  }
}
