import * as vscode from "vscode"

/**
 * Manages extension state and editor interactions
 */
export class ExtensionManager {
  private activeEditor: vscode.TextEditor | undefined
  private selectedText = ""
  private currentFile = ""

  constructor(private _context: vscode.ExtensionContext) {
    this.activeEditor = vscode.window.activeTextEditor
  }

  updateActiveEditor(editor: vscode.TextEditor) {
    this.activeEditor = editor
    this.currentFile = editor.document.fileName
  }

  handleTextChange(event: vscode.TextDocumentChangeEvent) {
    // Handle text changes - could trigger auto-suggestions
    console.log("Text changed in:", event.document.fileName)
  }

  handleSelectionChange(event: vscode.TextEditorSelectionChangeEvent) {
    const editor = event.textEditor
    if (editor.selection.isEmpty) {
      this.selectedText = ""
    } else {
      this.selectedText = editor.document.getText(editor.selection)
    }
  }

  getActiveEditor(): vscode.TextEditor | undefined {
    return this.activeEditor
  }

  getSelectedText(): string {
    return this.selectedText
  }

  getCurrentFile(): string {
    return this.currentFile
  }

  getLanguage(): string {
    return this.activeEditor?.document.languageId || "plaintext"
  }

  applyEdit(fileName: string, startLine: number, endLine: number, newCode: string): boolean {
    const editor = vscode.window.visibleTextEditors.find((e) => e.document.fileName === fileName)

    if (!editor) {
      return false
    }

    const startPos = new vscode.Position(startLine, 0)
    const endPos = new vscode.Position(endLine + 1, 0)
    const range = new vscode.Range(startPos, endPos)

    editor.edit((editBuilder) => {
      editBuilder.replace(range, newCode + "\n")
    })

    return true
  }

  addDecoration(line: number, _message: string, type: "info" | "warning" | "error") {
    if (!this.activeEditor) return

    const decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: this.getDecorationColor(type),
      isWholeLine: true,
    })

    const range = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 0))

    this.activeEditor.setDecorations(decorationType, [range])
  }

  private getDecorationColor(type: "info" | "warning" | "error"): string {
    switch (type) {
      case "error":
        return "rgba(255, 0, 0, 0.1)"
      case "warning":
        return "rgba(255, 165, 0, 0.1)"
      case "info":
        return "rgba(0, 0, 255, 0.1)"
    }
  }
}
