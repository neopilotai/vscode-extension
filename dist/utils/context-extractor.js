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
exports.getLanguageFromFile = exports.extractEditorContext = void 0;
const vscode = __importStar(require("vscode"));
const extractEditorContext = async (editor) => {
    const document = editor.document;
    const selection = editor.selection;
    const selectedText = document.getText(selection);
    const fileContent = document.getText();
    const beforeSelection = document.getText(new vscode.Range(new vscode.Position(0, 0), selection.start));
    const afterSelection = document.getText(new vscode.Range(selection.end, document.lineAt(document.lineCount - 1).range.end));
    return {
        selectedText,
        fileName: document.fileName,
        language: document.languageId,
        lineNumber: selection.start.line,
        columnNumber: selection.start.character,
        fileContent,
        beforeSelection,
        afterSelection,
    };
};
exports.extractEditorContext = extractEditorContext;
const getLanguageFromFile = (fileName) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const languageMap = {
        ts: "typescript",
        tsx: "typescript",
        js: "javascript",
        jsx: "javascript",
        py: "python",
        go: "go",
        rs: "rust",
        java: "java",
        cpp: "cpp",
        c: "c",
        cs: "csharp",
        rb: "ruby",
        php: "php",
    };
    return languageMap[ext] || ext;
};
exports.getLanguageFromFile = getLanguageFromFile;
//# sourceMappingURL=context-extractor.js.map