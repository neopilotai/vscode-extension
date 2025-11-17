import * as vscode from "vscode";
import type { AIService } from "../ai/ai-service";
/**
 * Provides code lenses for AI suggestions
 */
export declare class AICodeLensProvider implements vscode.CodeLensProvider {
    private _aiService;
    private codeLenses;
    private onDidChangeCodeLensesEmitter;
    onDidChangeCodeLenses: vscode.Event<void>;
    constructor(_aiService: AIService);
    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]>;
    resolveCodeLens(codeLens: vscode.CodeLens): vscode.CodeLens;
}
//# sourceMappingURL=code-lens-provider.d.ts.map