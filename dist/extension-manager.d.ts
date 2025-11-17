import * as vscode from "vscode";
/**
 * Manages extension state and editor interactions
 */
export declare class ExtensionManager {
    private _context;
    private activeEditor;
    private selectedText;
    private currentFile;
    constructor(_context: vscode.ExtensionContext);
    updateActiveEditor(editor: vscode.TextEditor): void;
    handleTextChange(event: vscode.TextDocumentChangeEvent): void;
    handleSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void;
    getActiveEditor(): vscode.TextEditor | undefined;
    getSelectedText(): string;
    getCurrentFile(): string;
    getLanguage(): string;
    applyEdit(fileName: string, startLine: number, endLine: number, newCode: string): boolean;
    addDecoration(line: number, _message: string, type: "info" | "warning" | "error"): void;
    private getDecorationColor;
}
//# sourceMappingURL=extension-manager.d.ts.map