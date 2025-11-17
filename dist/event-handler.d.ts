import * as vscode from "vscode";
import type { AIService } from "./ai/ai-service";
import type { SuggestionManager } from "./suggestion-manager";
import type { ExtensionManager } from "./extension-manager";
/**
 * Handles editor events and triggers AI operations
 */
export declare class EventHandler {
    private _aiService;
    private suggestionManager;
    private extensionManager;
    private configManager;
    private debounceTimer;
    private debounceDelay;
    constructor(_aiService: AIService, suggestionManager: SuggestionManager, extensionManager: ExtensionManager);
    onEditorChange(editor: vscode.TextEditor): void;
    onSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void;
    onTextChange(event: vscode.TextDocumentChangeEvent): void;
    private debounceAutoSuggest;
    private triggerAutoSuggest;
    dispose(): void;
}
//# sourceMappingURL=event-handler.d.ts.map