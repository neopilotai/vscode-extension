import * as vscode from "vscode";
import type { CodeSuggestion } from "./types/messages";
import type { AIService } from "./ai/ai-service";
/**
 * Manages code suggestions and their application
 */
export declare class SuggestionManager {
    private aiService;
    private suggestions;
    private decoratorManager;
    constructor(aiService: AIService);
    generateSuggestions(editor: vscode.TextEditor): Promise<CodeSuggestion[]>;
    applySuggestion(editor: vscode.TextEditor, suggestionId: string): Promise<boolean>;
    clearSuggestions(editor: vscode.TextEditor): void;
    dispose(): void;
}
//# sourceMappingURL=suggestion-manager.d.ts.map