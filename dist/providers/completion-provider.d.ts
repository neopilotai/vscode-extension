import * as vscode from "vscode";
import type { AIService } from "../ai/ai-service";
/**
 * Provides AI-powered code completions
 */
export declare class AICompletionProvider implements vscode.CompletionItemProvider {
    private aiService;
    constructor(aiService: AIService);
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken): Promise<vscode.CompletionItem[] | vscode.CompletionList | null>;
    private shouldTriggerCompletion;
}
//# sourceMappingURL=completion-provider.d.ts.map