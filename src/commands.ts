import * as vscode from "vscode"
import type { WebViewManager } from "./webview-manager"

/**
 * Handles VS Code commands
 */
export class CommandHandler {
  constructor(private webviewManager: WebViewManager) {}

  async openChat() {
    vscode.commands.executeCommand("ai-assistant-chat.focus")
  }

  async getCompletion() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    const position = editor.selection.active
    const context = editor.document.getText()

    this.webviewManager.broadcastMessage({
      type: "codeContext",
      payload: {
        selectedText: editor.document.getText(editor.selection),
        fileName: editor.document.fileName,
        language: editor.document.languageId,
        lineNumber: position.line,
        fullContent: context,
      },
    })
  }

  async explainCode() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    if (editor.selection.isEmpty) {
      vscode.window.showErrorMessage("Please select code to explain")
      return
    }

    this.webviewManager.broadcastMessage({
      type: "codeContext",
      payload: {
        selectedText: editor.document.getText(editor.selection),
        fileName: editor.document.fileName,
        language: editor.document.languageId,
        lineNumber: editor.selection.active.line,
      },
    })
  }

  async generateTests() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    if (editor.selection.isEmpty) {
      vscode.window.showErrorMessage("Please select code to generate tests for")
      return
    }

    this.webviewManager.broadcastMessage({
      type: "codeContext",
      payload: {
        selectedText: editor.document.getText(editor.selection),
        fileName: editor.document.fileName,
        language: editor.document.languageId,
        lineNumber: editor.selection.active.line,
      },
    })
  }
}
