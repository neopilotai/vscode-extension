import * as vscode from "vscode"
import type { CodeSuggestion } from "../types/messages"

/**
 * Manages inline decorations and visual feedback in the editor
 */
export class DecoratorManager {
  private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map()
  private activeDecorations: Map<string, vscode.Range[]> = new Map()

  constructor() {
    this.initializeDecorationTypes()
  }

  private initializeDecorationTypes() {
    // Suggestion decoration
    this.decorationTypes.set(
      "suggestion",
      vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor("editor.lineHighlightBackground"),
        border: "1px solid",
        borderColor: new vscode.ThemeColor("editorInfo.border"),
        isWholeLine: true,
      }),
    )

    // Error decoration
    this.decorationTypes.set(
      "error",
      vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor("editorError.background"),
        border: "1px solid",
        borderColor: new vscode.ThemeColor("editorError.border"),
        isWholeLine: true,
      }),
    )

    // Warning decoration
    this.decorationTypes.set(
      "warning",
      vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor("editorWarning.background"),
        border: "1px solid",
        borderColor: new vscode.ThemeColor("editorWarning.border"),
        isWholeLine: true,
      }),
    )

    // Optimization decoration
    this.decorationTypes.set(
      "optimization",
      vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor("editorInfo.background"),
        border: "1px solid",
        borderColor: new vscode.ThemeColor("editorInfo.border"),
        isWholeLine: true,
      }),
    )
  }

  addSuggestion(editor: vscode.TextEditor, suggestion: CodeSuggestion) {
    const range = new vscode.Range(
      new vscode.Position(suggestion.startLine, 0),
      new vscode.Position(suggestion.endLine, 0),
    )

    const decorationType = this.decorationTypes.get(suggestion.type) || this.decorationTypes.get("suggestion")
    if (!decorationType) return

    const key = `${suggestion.id}`
    const ranges = this.activeDecorations.get(key) || []
    ranges.push(range)
    this.activeDecorations.set(key, ranges)

    editor.setDecorations(decorationType, ranges)
  }

  removeSuggestion(editor: vscode.TextEditor, suggestionId: string) {
    const key = suggestionId
    const decorationType = this.decorationTypes.get("suggestion")
    if (!decorationType) return

    this.activeDecorations.delete(key)
    editor.setDecorations(decorationType, [])
  }

  clearAll(editor: vscode.TextEditor) {
    this.decorationTypes.forEach((decorationType) => {
      editor.setDecorations(decorationType, [])
    })
    this.activeDecorations.clear()
  }

  dispose() {
    this.decorationTypes.forEach((decorationType) => {
      decorationType.dispose()
    })
    this.decorationTypes.clear()
  }
}
