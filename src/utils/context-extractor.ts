import * as vscode from "vscode"

export interface EditorContext {
  selectedText: string
  fileName: string
  language: string
  lineNumber: number
  columnNumber: number
  fileContent: string
  beforeSelection: string
  afterSelection: string
}

export const extractEditorContext = async (editor: vscode.TextEditor): Promise<EditorContext> => {
  const document = editor.document
  const selection = editor.selection
  const selectedText = document.getText(selection)
  const fileContent = document.getText()

  const beforeSelection = document.getText(new vscode.Range(new vscode.Position(0, 0), selection.start))
  const afterSelection = document.getText(
    new vscode.Range(selection.end, document.lineAt(document.lineCount - 1).range.end),
  )

  return {
    selectedText,
    fileName: document.fileName,
    language: document.languageId,
    lineNumber: selection.start.line,
    columnNumber: selection.start.character,
    fileContent,
    beforeSelection,
    afterSelection,
  }
}

export const getLanguageFromFile = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""
  const languageMap: Record<string, string> = {
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
  }
  return languageMap[ext] || ext
}
