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
exports.AIHoverProvider = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Provides hover information with AI insights
 */
class AIHoverProvider {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async provideHover(document, position, token) {
        const range = document.getWordRangeAtPosition(position);
        if (!range)
            return null;
        const word = document.getText(range);
        const line = document.lineAt(position.line).text;
        // Only show hover for code-like words
        if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(word)) {
            return null;
        }
        // Get context around the word
        const startLine = Math.max(0, position.line - 5);
        const endLine = Math.min(document.lineCount, position.line + 5);
        const context = document.getText(new vscode.Range(startLine, 0, endLine, 0));
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`**${word}**\n\n`);
        markdown.appendMarkdown("*AI Assistant*\n\n");
        markdown.appendMarkdown("Hover over code to see AI insights. Click code lenses for more options.");
        return new vscode.Hover(markdown, range);
    }
}
exports.AIHoverProvider = AIHoverProvider;
//# sourceMappingURL=hover-provider.js.map