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
exports.CommandHandler = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Handles VS Code commands
 */
class CommandHandler {
    constructor(webviewManager) {
        this.webviewManager = webviewManager;
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
        const position = editor.selection.active;
        const context = editor.document.getText();
        this.webviewManager.broadcastMessage({
            type: "codeContext",
            payload: {
                selectedText: editor.document.getText(editor.selection),
                fileName: editor.document.fileName,
                language: editor.document.languageId,
                lineNumber: position.line,
                fullContent: context,
            },
        });
    }
    async explainCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        if (editor.selection.isEmpty) {
            vscode.window.showErrorMessage("Please select code to explain");
            return;
        }
        this.webviewManager.broadcastMessage({
            type: "codeContext",
            payload: {
                selectedText: editor.document.getText(editor.selection),
                fileName: editor.document.fileName,
                language: editor.document.languageId,
                lineNumber: editor.selection.active.line,
            },
        });
    }
    async generateTests() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        if (editor.selection.isEmpty) {
            vscode.window.showErrorMessage("Please select code to generate tests for");
            return;
        }
        this.webviewManager.broadcastMessage({
            type: "codeContext",
            payload: {
                selectedText: editor.document.getText(editor.selection),
                fileName: editor.document.fileName,
                language: editor.document.languageId,
                lineNumber: editor.selection.active.line,
            },
        });
    }
}
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=commands.js.map