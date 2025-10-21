"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AICodeLensProvider = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Provides code lenses for AI suggestions
 */
class AICodeLensProvider {
    constructor(aiService) {
        this.aiService = aiService;
        this.codeLenses = [];
        this.onDidChangeCodeLensesEmitter = new vscode.EventEmitter();
        this.onDidChangeCodeLenses = this.onDidChangeCodeLensesEmitter.event;
        vscode.workspace.onDidChangeTextDocument(() => {
            this.onDidChangeCodeLensesEmitter.fire();
        });
    }
    async provideCodeLenses(document, token) {
        this.codeLenses = [];
        // Add code lenses for functions and classes
        const regex = /^\s*(async\s+)?(function|class|const\s+\w+\s*=\s*(async\s*)?\()/gm;
        let match;
        while ((match = regex.exec(document.getText())) && !token.isCancellationRequested) {
            const line = document.lineAt(document.positionAt(match.index).line);
            const range = new vscode.Range(line.range.start, line.range.end);
            // Explain code lens
            const explainLens = new vscode.CodeLens(range, {
                title: "$(sparkle) Explain",
                command: "ai-assistant.explainCode",
                arguments: [document.uri, range],
            });
            // Generate tests lens
            const testsLens = new vscode.CodeLens(range, {
                title: "$(beaker) Generate Tests",
                command: "ai-assistant.generateTests",
                arguments: [document.uri, range],
            });
            // Get suggestions lens
            const suggestionsLens = new vscode.CodeLens(range, {
                title: "$(lightbulb) Suggestions",
                command: "ai-assistant.getSuggestions",
                arguments: [document.uri, range],
            });
            this.codeLenses.push(explainLens, testsLens, suggestionsLens);
        }
        return this.codeLenses;
    }
    resolveCodeLens(codeLens) {
        return codeLens;
    }
}
exports.AICodeLensProvider = AICodeLensProvider;
//# sourceMappingURL=code-lens-provider.js.map