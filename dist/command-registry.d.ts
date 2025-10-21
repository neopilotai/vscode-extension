import * as vscode from "vscode";
import type { AIService } from "./ai/ai-service";
import type { SuggestionManager } from "./suggestion-manager";
import type { WebViewManager } from "./webview-manager";
import type { ExtensionManager } from "./extension-manager";
/**
 * Registers and handles all extension commands
 */
export declare class CommandRegistry {
    private aiService;
    private suggestionManager;
    private webviewManager;
    private extensionManager;
    private streamingHandler;
    constructor(aiService: AIService, suggestionManager: SuggestionManager, webviewManager: WebViewManager, extensionManager: ExtensionManager);
    registerCommands(context: vscode.ExtensionContext): void;
    private openChat;
    private getCompletion;
    private explainCode;
    private generateTests;
    private getSuggestions;
    private applySuggestion;
    private clearSuggestions;
    private configureApiKey;
    private toggleAutoSuggest;
}
//# sourceMappingURL=command-registry.d.ts.map