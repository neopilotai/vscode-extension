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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AICompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Provides AI-powered code completions
 */
class AICompletionProvider {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async provideCompletionItems(document, position, _token) {
        // Get the current line up to the cursor
        const line = document.lineAt(position.line).text;
        const linePrefix = line.substring(0, position.character);
        // Only trigger for specific patterns
        if (!this.shouldTriggerCompletion(linePrefix)) {
            return null;
        }
        try {
            const completionText = await this.aiService.getCompletion(linePrefix, document.languageId);
            const item = new vscode.CompletionItem("AI Completion", vscode.CompletionItemKind.Snippet);
            item.insertText = new vscode.SnippetString(completionText);
            item.detail = "AI-generated completion";
            item.documentation = "Completion suggested by AI Assistant";
            item.sortText = "0"; // Sort to top
            return [item];
        }
        catch (error) {
            console.error("Error generating completion:", error);
            return null;
        }
    }
    shouldTriggerCompletion(linePrefix) {
        // Trigger after function/class definitions, comments, or specific keywords
        const triggers = [
            /function\s+\w*$/, // After 'function'
            /class\s+\w*$/, // After 'class'
            /const\s+\w+\s*=\s*$/, // After 'const x ='
            /\/\/\s*$/, // After comment
            /\{\s*$/, // After opening brace
        ];
        return triggers.some((trigger) => trigger.test(linePrefix));
    }
}
exports.AICompletionProvider = AICompletionProvider;
//# sourceMappingURL=completion-provider.js.map