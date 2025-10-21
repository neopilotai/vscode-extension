import * as vscode from "vscode"

export interface Suggestion {
  id: string
  range: vscode.Range
  text: string
  type: "completion" | "refactor" | "explanation"
}

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: "rgba(100, 200, 255, 0.2)",
  border: "1px solid rgba(100, 200, 255, 0.5)",
  borderRadius: "3px",
  isWholeLine: false,
})

const hoverMessage = (suggestion: Suggestion): vscode.MarkdownString => {
  const md = new vscode.MarkdownString()
  md.appendMarkdown(`**${suggestion.type}**\n\n`)
  md.appendCodeblock(suggestion.text, "text")
  md.appendMarkdown('\n\n[Apply](command:ai-assistant.applySuggestion?["' + suggestion.id + '"])')
  return md
}

export const applyDecorations = (editor: vscode.TextEditor, suggestions: Suggestion[]): void => {
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
  }))

  editor.setDecorations(decorationType, decorations)
}

export const clearDecorations = (editor: vscode.TextEditor): void => {
  editor.setDecorations(decorationType, [])
}

export const applySuggestionToEditor = (editor: vscode.TextEditor, suggestion: Suggestion) => {
  return editor.edit((editBuilder) => {
    editBuilder.replace(suggestion.range, suggestion.text)
  })
}
