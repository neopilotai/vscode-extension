import * as vscode from "vscode";
export interface EditorContext {
    selectedText: string;
    fileName: string;
    language: string;
    lineNumber: number;
    columnNumber: number;
    fileContent: string;
    beforeSelection: string;
    afterSelection: string;
}
export declare const extractEditorContext: (editor: vscode.TextEditor) => Promise<EditorContext>;
export declare const getLanguageFromFile: (fileName: string) => string;
//# sourceMappingURL=context-extractor.d.ts.map