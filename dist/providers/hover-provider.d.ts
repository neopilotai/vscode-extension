import * as vscode from "vscode";
import type { AIService } from "../ai/ai-service";
/**
 * Provides hover information with AI insights
 */
export declare class AIHoverProvider implements vscode.HoverProvider {
    private _aiService;
    constructor(_aiService: AIService);
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Hover | null>;
}
//# sourceMappingURL=hover-provider.d.ts.map