import * as vscode from "vscode";
export interface Suggestion {
    id: string;
    range: vscode.Range;
    text: string;
    type: "completion" | "refactor" | "explanation";
}
export declare const applyDecorations: (editor: vscode.TextEditor, suggestions: Suggestion[]) => void;
export declare const clearDecorations: (editor: vscode.TextEditor) => void;
export declare const applySuggestionToEditor: (editor: vscode.TextEditor, suggestion: Suggestion) => Thenable<boolean>;
//# sourceMappingURL=decoration-manager.d.ts.map