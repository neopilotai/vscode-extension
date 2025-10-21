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
exports.DecoratorManager = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Manages inline decorations and visual feedback in the editor
 */
class DecoratorManager {
    constructor() {
        this.decorationTypes = new Map();
        this.activeDecorations = new Map();
        this.initializeDecorationTypes();
    }
    initializeDecorationTypes() {
        // Suggestion decoration
        this.decorationTypes.set("suggestion", vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor("editor.lineHighlightBackground"),
            border: "1px solid",
            borderColor: new vscode.ThemeColor("editorInfo.border"),
            isWholeLine: true,
        }));
        // Error decoration
        this.decorationTypes.set("error", vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor("editorError.background"),
            border: "1px solid",
            borderColor: new vscode.ThemeColor("editorError.border"),
            isWholeLine: true,
        }));
        // Warning decoration
        this.decorationTypes.set("warning", vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor("editorWarning.background"),
            border: "1px solid",
            borderColor: new vscode.ThemeColor("editorWarning.border"),
            isWholeLine: true,
        }));
        // Optimization decoration
        this.decorationTypes.set("optimization", vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor("editorInfo.background"),
            border: "1px solid",
            borderColor: new vscode.ThemeColor("editorInfo.border"),
            isWholeLine: true,
        }));
    }
    addSuggestion(editor, suggestion) {
        const range = new vscode.Range(new vscode.Position(suggestion.startLine, 0), new vscode.Position(suggestion.endLine, 0));
        const decorationType = this.decorationTypes.get(suggestion.type) || this.decorationTypes.get("suggestion");
        if (!decorationType)
            return;
        const key = `${suggestion.id}`;
        const ranges = this.activeDecorations.get(key) || [];
        ranges.push(range);
        this.activeDecorations.set(key, ranges);
        editor.setDecorations(decorationType, ranges);
    }
    removeSuggestion(editor, suggestionId) {
        const key = suggestionId;
        const decorationType = this.decorationTypes.get("suggestion");
        if (!decorationType)
            return;
        this.activeDecorations.delete(key);
        editor.setDecorations(decorationType, []);
    }
    clearAll(editor) {
        this.decorationTypes.forEach((decorationType) => {
            editor.setDecorations(decorationType, []);
        });
        this.activeDecorations.clear();
    }
    dispose() {
        this.decorationTypes.forEach((decorationType) => {
            decorationType.dispose();
        });
        this.decorationTypes.clear();
    }
}
exports.DecoratorManager = DecoratorManager;
//# sourceMappingURL=decorator-manager.js.map