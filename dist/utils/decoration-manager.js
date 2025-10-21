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
exports.applySuggestionToEditor = exports.clearDecorations = exports.applyDecorations = void 0;
const vscode = __importStar(require("vscode"));
const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(100, 200, 255, 0.2)",
    border: "1px solid rgba(100, 200, 255, 0.5)",
    borderRadius: "3px",
    isWholeLine: false,
});
const hoverMessage = (suggestion) => {
    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${suggestion.type}**\n\n`);
    md.appendCodeblock(suggestion.text, "text");
    md.appendMarkdown('\n\n[Apply](command:ai-assistant.applySuggestion?["' + suggestion.id + '"])');
    return md;
};
const applyDecorations = (editor, suggestions) => {
    const decorations = suggestions.map((suggestion) => ({
        range: suggestion.range,
        hoverMessage: hoverMessage(suggestion),
        renderOptions: {
            after: {
                contentText: ` // ${suggestion.type}`,
                color: "rgba(150, 150, 150, 0.7)",
                fontStyle: "italic",
            },
        },
    }));
    editor.setDecorations(decorationType, decorations);
};
exports.applyDecorations = applyDecorations;
const clearDecorations = (editor) => {
    editor.setDecorations(decorationType, []);
};
exports.clearDecorations = clearDecorations;
const applySuggestionToEditor = (editor, suggestion) => {
    return editor.edit((editBuilder) => {
        editBuilder.replace(suggestion.range, suggestion.text);
    });
};
exports.applySuggestionToEditor = applySuggestionToEditor;
//# sourceMappingURL=decoration-manager.js.map