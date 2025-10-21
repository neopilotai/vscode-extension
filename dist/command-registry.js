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
exports.CommandRegistry = void 0;
const vscode = __importStar(require("vscode"));
const streaming_handler_1 = require("./ai/streaming-handler");
/**
 * Registers and handles all extension commands
 */
class CommandRegistry {
    constructor(aiService, suggestionManager, webviewManager, extensionManager) {
        this.aiService = aiService;
        this.suggestionManager = suggestionManager;
        this.webviewManager = webviewManager;
        this.extensionManager = extensionManager;
        this.streamingHandler = new streaming_handler_1.StreamingHandler(webviewManager, aiService);
    }
    registerCommands(context) {
        // Open Chat command
        context.subscriptions.push(vscode.commands.registerCommand("ai-assistant.openChat", () => this.openChat()));
        // Get Completion command
        context.subscriptions.push(vscode.commands.registerCommand("ai-assistant.getCompletion", () => this.getCompletion()));
        // Explain Code command
        context.subscriptions.push(vscode.commands.registerCommand("ai-assistant.explainCode", (uri, range) => this.explainCode(uri, range)));
        // Generate Tests command
        context.subscriptions.push(vscode.commands.registerCommand("ai-assistant.generateTests", (uri, range) => this.generateTests(uri, range)));
        // Get Suggestions command
        context.subscriptions.push(vscode.commands.registerCommand("ai-assistant.getSuggestions", (uri, range) => this.getSuggestions(uri, range)));
        // Apply Suggestion command
        context.subscriptions.push(vscode.commands.registerCommand("ai-assistant.applySuggestion", (suggestionId) => this.applySuggestion(suggestionId)));
        // Clear Suggestions command
        context.subscriptions.push(vscode.commands.registerCommand("ai-assistant.clearSuggestions", () => this.clearSuggestions()));
        // Configure API Key command
        context.subscriptions.push(vscode.commands.registerCommand("ai-assistant.configureApiKey", () => this.configureApiKey()));
        // Toggle Auto Suggest command
        context.subscriptions.push(vscode.commands.registerCommand("ai-assistant.toggleAutoSuggest", () => this.toggleAutoSuggest()));
    }
    async openChat() {
        vscode.commands.executeCommand("ai-assistant-chat.focus");
    }
    async getCompletion() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showErrorMessage("Please select code to complete");
            return;
        }
        try {
            await this.streamingHandler.handleCompletion(selectedText, editor.document.languageId);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to get completion: ${String(error)}`);
        }
    }
    async explainCode(uri, range) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showErrorMessage("Please select code to explain");
            return;
        }
        try {
            await this.streamingHandler.handleExplain(selectedText, editor.document.languageId);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to explain code: ${String(error)}`);
        }
    }
    async generateTests(uri, range) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showErrorMessage("Please select code to generate tests for");
            return;
        }
        try {
            await this.streamingHandler.handleGenerateTests(selectedText, editor.document.languageId);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to generate tests: ${String(error)}`);
        }
    }
    async getSuggestions(uri, range) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        try {
            const suggestions = await this.suggestionManager.generateSuggestions(editor);
            if (suggestions.length === 0) {
                vscode.window.showInformationMessage("No suggestions available");
            }
            else {
                vscode.window.showInformationMessage(`Generated ${suggestions.length} suggestion(s)`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to get suggestions: ${String(error)}`);
        }
    }
    async applySuggestion(suggestionId) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        try {
            await this.suggestionManager.applySuggestion(editor, suggestionId);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to apply suggestion: ${String(error)}`);
        }
    }
    clearSuggestions() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        this.suggestionManager.clearSuggestions(editor);
        vscode.window.showInformationMessage("Suggestions cleared");
    }
    async configureApiKey() {
        const provider = await vscode.window.showQuickPick(["OpenAI", "Anthropic"], {
            placeHolder: "Select AI provider",
        });
        if (!provider)
            return;
        const apiKey = await vscode.window.showInputBox({
            prompt: `Enter your ${provider} API key`,
            password: true,
            ignoreFocusOut: true,
        });
        if (apiKey) {
            await vscode.workspace
                .getConfiguration("ai-assistant")
                .update("apiKey", apiKey, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`${provider} API key configured`);
        }
    }
    async toggleAutoSuggest() {
        const config = vscode.workspace.getConfiguration("ai-assistant");
        const current = config.get("autoSuggest");
        await config.update("autoSuggest", !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Auto suggest ${!current ? "enabled" : "disabled"}`);
    }
}
exports.CommandRegistry = CommandRegistry;
//# sourceMappingURL=command-registry.js.map