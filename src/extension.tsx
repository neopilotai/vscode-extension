import * as vscode from "vscode"
import { getAICompletion, type CompletionRequestPayload } from "./ai/completion"
import type { WebViewToExtensionMessage, ExtensionToWebViewMessage } from "./types/messages"

// ============================================================================
// Types
// ============================================================================

interface ExtensionState {
  context: vscode.ExtensionContext
  webviewPanel: vscode.WebviewPanel | undefined
  inlineCompletionDisposable: vscode.Disposable | undefined
}

// ============================================================================
// State Management (Functional)
// ============================================================================

let state: ExtensionState = {
  context: null as any,
  webviewPanel: undefined,
  inlineCompletionDisposable: undefined,
}

const setState = (updates: Partial<ExtensionState>): void => {
  state = { ...state, ...updates }
}

const getState = (): ExtensionState => state

// ============================================================================
// WebView Content Generation
// ============================================================================

const getWebviewContent = (webview: vscode.Webview, extensionUri: vscode.Uri): string => {
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "dist", "webview", "index.js"))
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "dist", "webview", "style.css"))

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>AI Coding Assistant</title>
</head>
<body>
    <div id="root"></div>
    <script src="${scriptUri}"></script>
</body>
</html>`
}

// ============================================================================
// WebView Panel Management
// ============================================================================

const createWebviewPanel = (context: vscode.ExtensionContext): vscode.WebviewPanel => {
  const panel = vscode.window.createWebviewPanel("aiAssistant", "AI Coding Assistant", vscode.ViewColumn.Beside, {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
  })

  panel.webview.html = getWebviewContent(panel.webview, context.extensionUri)
  return panel
}

const openAssistantPanel = (context: vscode.ExtensionContext): void => {
  const currentState = getState()

  if (currentState.webviewPanel) {
    currentState.webviewPanel.reveal(vscode.ViewColumn.Beside)
    return
  }

  const panel = createWebviewPanel(context)
  setState({ webviewPanel: panel })

  // Handle messages from WebView
  panel.webview.onDidReceiveMessage(
    (message: WebViewToExtensionMessage) => {
      handleWebViewMessage(message, panel.webview)
    },
    undefined,
    context.subscriptions,
  )

  // Handle panel disposal
  panel.onDidDispose(
    () => {
      setState({ webviewPanel: undefined })
    },
    undefined,
    context.subscriptions,
  )
}

// ============================================================================
// Message Handling
// ============================================================================

const handleWebViewMessage = async (message: WebViewToExtensionMessage, webview: vscode.Webview): Promise<void> => {
  switch (message.type) {
    case "getCompletion": {
      await handleCompletionRequest(message.payload, webview)
      break
    }

    case "chat": {
      // Handle chat messages
      console.log("[AI Assistant] Chat message received:", message.payload.content)
      break
    }

    case "explainCode": {
      // Handle code explanation
      console.log("[AI Assistant] Explain code request:", message.payload.selectedText)
      break
    }

    case "generateTests": {
      // Handle test generation
      console.log("[AI Assistant] Generate tests request:", message.payload.selectedText)
      break
    }

    case "applyEdit": {
      await handleApplyEdit(message.payload, webview)
      break
    }

    case "ready": {
      console.log("[AI Assistant] WebView is ready")
      break
    }
  }
}

const handleCompletionRequest = async (payload: CompletionRequestPayload, webview: vscode.Webview): Promise<void> => {
  try {
    // Stream completion with chunks
    let fullCompletion = ""

    const completion = await getAICompletion(payload, (chunk: string) => {
      fullCompletion += chunk

      // Send stream chunk to WebView
      const streamMessage: ExtensionToWebViewMessage = {
        type: "streamChunk",
        payload: {
          id: `completion-${Date.now()}`,
          chunk,
          isComplete: false,
        },
      }
      webview.postMessage(streamMessage)
    })

    // Send completion response
    const response: ExtensionToWebViewMessage = {
      type: "completionResponse",
      payload: {
        completions: [
          {
            label: "AI Completion",
            detail: `Suggested completion for ${payload.language}`,
            insertText: completion,
            kind: "snippet",
          },
        ],
      },
    }

    webview.postMessage(response)
  } catch (error) {
    const errorResponse: ExtensionToWebViewMessage = {
      type: "error",
      payload: {
        code: "COMPLETION_ERROR",
        message: "Failed to generate completion",
        details: { error: String(error) },
      },
    }
    webview.postMessage(errorResponse)
  }
}

const handleApplyEdit = async (
  payload: { suggestionId: string; startLine: number; endLine: number; newCode: string; fileName: string },
  webview: vscode.Webview,
): Promise<void> => {
  try {
    const editor = vscode.window.activeTextEditor

    if (!editor || editor.document.fileName !== payload.fileName) {
      throw new Error("File not found in active editor")
    }

    const startPos = new vscode.Position(payload.startLine, 0)
    const endPos = new vscode.Position(payload.endLine, 0)
    const range = new vscode.Range(startPos, endPos)

    await editor.edit((editBuilder) => {
      editBuilder.replace(range, payload.newCode)
    })

    const response: ExtensionToWebViewMessage = {
      type: "editApplied",
      payload: {
        success: true,
        message: "Code edit applied successfully",
        fileName: payload.fileName,
        appliedLines: { start: payload.startLine, end: payload.endLine },
      },
    }

    webview.postMessage(response)
  } catch (error) {
    const errorResponse: ExtensionToWebViewMessage = {
      type: "error",
      payload: {
        code: "EDIT_ERROR",
        message: "Failed to apply code edit",
        details: { error: String(error) },
      },
    }
    webview.postMessage(errorResponse)
  }
}

// ============================================================================
// Inline Completion Provider
// ============================================================================

const createInlineCompletionProvider = (): vscode.InlineCompletionItemProvider => ({
  async provideInlineCompletionItems(document, position, context, token) {
    const line = document.lineAt(position.line)
    const lineText = line.text.substring(0, position.character)
    const language = document.languageId

    // Supported languages for inline completions
    const supportedLanguages = ["javascript", "typescript", "python", "java", "cpp", "csharp", "go", "rust"]

    if (!supportedLanguages.includes(language)) {
      return []
    }

    // Skip completions for comments
    if (lineText.trim().startsWith("//") || lineText.trim().startsWith("#")) {
      return []
    }

    // Skip if token is cancelled
    if (token.isCancellationRequested) {
      return []
    }

    try {
      const completion = await getAICompletion({
        code: document.getText(),
        language,
        cursor: { line: position.line, character: position.character },
      })

      return [new vscode.InlineCompletionItem(completion, new vscode.Range(position, position))]
    } catch (error) {
      console.error("[AI Assistant] Inline completion error:", error)
      return []
    }
  },
})

const registerInlineCompletionProvider = (context: vscode.ExtensionContext): void => {
  const provider = createInlineCompletionProvider()
  const disposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider)

  setState({ inlineCompletionDisposable: disposable })
  context.subscriptions.push(disposable)
}

// ============================================================================
// Command Registration
// ============================================================================

const registerCommand = (
  context: vscode.ExtensionContext,
  commandId: string,
  handler: (...args: any[]) => any,
): void => {
  const disposable = vscode.commands.registerCommand(commandId, handler)
  context.subscriptions.push(disposable)
}

const registerCommands = (context: vscode.ExtensionContext): void => {
  // Main command to start the assistant
  registerCommand(context, "ai.assistant.start", () => {
    openAssistantPanel(context)
  })

  // Get completion command
  registerCommand(context, "ai.assistant.getCompletion", async () => {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    const selection = editor.selection
    const selectedText = editor.document.getText(selection)
    const language = editor.document.languageId

    if (!selectedText) {
      vscode.window.showErrorMessage("Please select code to complete")
      return
    }

    try {
      const completion = await getAICompletion({
        code: selectedText,
        language,
        cursor: { line: selection.active.line, character: selection.active.character },
      })

      await editor.edit((editBuilder) => {
        editBuilder.insert(selection.end, "\n" + completion)
      })

      vscode.window.showInformationMessage("Completion inserted successfully")
    } catch (error) {
      vscode.window.showErrorMessage(`Completion failed: ${String(error)}`)
    }
  })

  // Explain code command
  registerCommand(context, "ai.assistant.explainCode", () => {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    const selection = editor.selection
    const selectedText = editor.document.getText(selection)

    if (!selectedText) {
      vscode.window.showErrorMessage("Please select code to explain")
      return
    }

    openAssistantPanel(context)
  })

  // Generate tests command
  registerCommand(context, "ai.assistant.generateTests", () => {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      vscode.window.showErrorMessage("No active editor")
      return
    }

    const selection = editor.selection
    const selectedText = editor.document.getText(selection)

    if (!selectedText) {
      vscode.window.showErrorMessage("Please select code to test")
      return
    }

    openAssistantPanel(context)
  })
}

// ============================================================================
// Extension Lifecycle
// ============================================================================

export const activate = (context: vscode.ExtensionContext): void => {
  console.log("[AI Assistant] Extension activated")

  setState({ context })

  // Register all commands
  registerCommands(context)

  // Register inline completion provider
  registerInlineCompletionProvider(context)

  console.log("[AI Assistant] All commands and providers registered")
}

export const deactivate = (): void => {
  console.log("[AI Assistant] Extension deactivated")

  const currentState = getState()

  if (currentState.inlineCompletionDisposable) {
    currentState.inlineCompletionDisposable.dispose()
  }

  if (currentState.webviewPanel) {
    currentState.webviewPanel.dispose()
  }
}
