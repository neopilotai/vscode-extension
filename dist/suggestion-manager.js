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
exports.SuggestionManager = void 0;
const vscode = __importStar(require("vscode"));
const decorator_manager_1 = require("./decorations/decorator-manager");
/**
 * Manages code suggestions and their application
 */
class SuggestionManager {
    constructor(aiService) {
        this.aiService = aiService;
        this.suggestions = new Map();
        this.decoratorManager = new decorator_manager_1.DecoratorManager();
    }
    async generateSuggestions(editor) {
        const document = editor.document;
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showWarningMessage("Please select code to get suggestions");
            return [];
        }
        try {
            const suggestions = await this.aiService.generateSuggestions(selectedText, document.languageId);
            // Store suggestions
            suggestions.forEach((suggestion) => {
                this.suggestions.set(suggestion.id, suggestion);
                this.decoratorManager.addSuggestion(editor, suggestion);
            });
            return suggestions;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to generate suggestions: ${String(error)}`);
            return [];
        }
    }
    async applySuggestion(editor, suggestionId) {
        const suggestion = this.suggestions.get(suggestionId);
        if (!suggestion) {
            vscode.window.showErrorMessage("Suggestion not found");
            return false;
        }
        try {
            const startPos = new vscode.Position(suggestion.startLine, 0);
            const endPos = new vscode.Position(suggestion.endLine + 1, 0);
            const range = new vscode.Range(startPos, endPos);
            const success = await editor.edit((editBuilder) => {
                editBuilder.replace(range, suggestion.code + "\n");
            });
            if (success) {
                this.decoratorManager.removeSuggestion(editor, suggestionId);
                this.suggestions.delete(suggestionId);
                vscode.window.showInformationMessage("Suggestion applied successfully");
            }
            return success;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to apply suggestion: ${String(error)}`);
            return false;
        }
    }
    clearSuggestions(editor) {
        this.decoratorManager.clearAll(editor);
        this.suggestions.clear();
    }
    dispose() {
        this.decoratorManager.dispose();
    }
}
exports.SuggestionManager = SuggestionManager;
//# sourceMappingURL=suggestion-manager.js.map