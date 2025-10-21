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
exports.ExtensionManager = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Manages extension state and editor interactions
 */
class ExtensionManager {
    constructor(context) {
        this.context = context;
        this.selectedText = "";
        this.currentFile = "";
        this.activeEditor = vscode.window.activeTextEditor;
    }
    updateActiveEditor(editor) {
        this.activeEditor = editor;
        this.currentFile = editor.document.fileName;
    }
    handleTextChange(event) {
        // Handle text changes - could trigger auto-suggestions
        console.log("Text changed in:", event.document.fileName);
    }
    handleSelectionChange(event) {
        const editor = event.textEditor;
        if (editor.selection.isEmpty) {
            this.selectedText = "";
        }
        else {
            this.selectedText = editor.document.getText(editor.selection);
        }
    }
    getActiveEditor() {
        return this.activeEditor;
    }
    getSelectedText() {
        return this.selectedText;
    }
    getCurrentFile() {
        return this.currentFile;
    }
    getLanguage() {
        return this.activeEditor?.document.languageId || "plaintext";
    }
    applyEdit(fileName, startLine, endLine, newCode) {
        const editor = vscode.window.visibleTextEditors.find((e) => e.document.fileName === fileName);
        if (!editor) {
            return false;
        }
        const startPos = new vscode.Position(startLine, 0);
        const endPos = new vscode.Position(endLine + 1, 0);
        const range = new vscode.Range(startPos, endPos);
        editor.edit((editBuilder) => {
            editBuilder.replace(range, newCode + "\n");
        });
        return true;
    }
    addDecoration(line, message, type) {
        if (!this.activeEditor)
            return;
        const decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: this.getDecorationColor(type),
            isWholeLine: true,
        });
        const range = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 0));
        this.activeEditor.setDecorations(decorationType, [range]);
    }
    getDecorationColor(type) {
        switch (type) {
            case "error":
                return "rgba(255, 0, 0, 0.1)";
            case "warning":
                return "rgba(255, 165, 0, 0.1)";
            case "info":
                return "rgba(0, 0, 255, 0.1)";
        }
    }
}
exports.ExtensionManager = ExtensionManager;
//# sourceMappingURL=extension-manager.js.map