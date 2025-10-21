import * as vscode from "vscode";
import type { CodeSuggestion } from "../types/messages";
/**
 * Manages inline decorations and visual feedback in the editor
 */
export declare class DecoratorManager {
    private decorationTypes;
    private activeDecorations;
    constructor();
    private initializeDecorationTypes;
    addSuggestion(editor: vscode.TextEditor, suggestion: CodeSuggestion): void;
    removeSuggestion(editor: vscode.TextEditor, suggestionId: string): void;
    clearAll(editor: vscode.TextEditor): void;
    dispose(): void;
}
//# sourceMappingURL=decorator-manager.d.ts.map