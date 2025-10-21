import * as vscode from "vscode"
import path from "path"
import { getAICompletionFull, type CompletionPayload } from "./ai/completion"
import type { WebViewToExtensionMessage, ExtensionToWebViewMessage, CompletionRequest } from "./types/messages"
import { AIService } from "./ai/ai-service"

// ============================================================================
// Types
// ============================================================================

interface ExtensionState {
  context: vscode.ExtensionContext
  webviewPanel: vscode.WebviewPanel | undefined
  inlineCompletionDisposable: vscode.Disposable | undefined
  aiService: AIService | undefined
}

// ============================================================================
// State Management (Functional)
// ============================================================================

let state: ExtensionState = {
  context: null as any,
  webviewPanel: undefined,
  inlineCompletionDisposable: undefined,
  aiService: undefined,
}

const setState = (updates: Partial<ExtensionState>): void => {
  state = { ...state, ...updates }
}

const getState = (): ExtensionState => state

// ============================================================================
// WebView Content Generation
// ============================================================================

const getWebviewContent = (webview: vscode.Webview, extensionUri: vscode.Uri): string => {
  const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(extensionUri.fsPath, "dist", "webview", "index.js")))
  const styleUri = webview.asWebviewUri(vscode.Uri.file(path.join(extensionUri.fsPath, "dist", "webview", "style.css")))

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
    localResourceRoots: [vscode.Uri.file(path.join(context.extensionUri.fsPath, "dist"))],
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
  const currentState = getState()

  switch (message.type) {
    case "getCompletion": {
      await handleCompletionRequest(message.payload, webview)
      break
    }

    case "chat": {
      await handleChatRequest(message.payload, webview)
      break
    }

    case "explainCode": {
      await handleExplainCodeRequest(message.payload, webview)
      break
    }

    case "generateTests": {
      await handleGenerateTestsRequest(message.payload, webview)
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

const handleCompletionRequest = async (payload: CompletionRequest, webview: vscode.Webview): Promise<void> => {
  try {
    // Transform CompletionRequest to CompletionPayload
    const completionPayload: CompletionPayload = {
      code: payload.context,
      language: payload.language,
      cursor: payload.position,
    }

    const completion = await getAICompletionFull(completionPayload)

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

const handleChatRequest = async (payload: { id: string; content: string; codeContext?: any }, webview: vscode.Webview): Promise<void> => {
  try {
    const currentState = getState()

    if (!currentState.aiService) {
      throw new Error("AI service not initialized")
    }

    // Add user message to conversation history
    currentState.aiService.addToHistory({
      id: payload.id,
      role: "user",
      content: payload.content,
      timestamp: Date.now(),
      codeContext: payload.codeContext,
    })

    // Send initial response to indicate AI is thinking
    const response: ExtensionToWebViewMessage = {
      type: "chatResponse",
      payload: {
        id: `response-${Date.now()}`,
        content: "",
        timestamp: Date.now(),
      },
    }
    webview.postMessage(response)

    // Stream the AI response
    let fullContent = ""
    const messageId = `response-${Date.now()}`

    for await (const chunk of currentState.aiService.chatStream(payload.content)) {
      fullContent += chunk

      // Send streaming chunk to WebView
      const streamMessage: ExtensionToWebViewMessage = {
        type: "streamChunk",
        payload: {
          id: messageId,
          chunk,
          isComplete: false,
        },
      }
      webview.postMessage(streamMessage)
    }

    // Send final response
    const finalResponse: ExtensionToWebViewMessage = {
      type: "chatResponse",
      payload: {
        id: messageId,
        content: fullContent,
        timestamp: Date.now(),
      },
    }
    webview.postMessage(finalResponse)

    // Add assistant message to conversation history
    currentState.aiService.addToHistory({
      id: messageId,
      role: "assistant",
      content: fullContent,
      timestamp: Date.now(),
    })

  } catch (error) {
    const errorResponse: ExtensionToWebViewMessage = {
      type: "error",
      payload: {
        code: "CHAT_ERROR",
        message: "Failed to generate chat response",
        details: { error: String(error) },
      },
    }
    webview.postMessage(errorResponse)
  }
}

const handleExplainCodeRequest = async (payload: { selectedText: string; fileName: string; language: string; lineNumber: number }, webview: vscode.Webview): Promise<void> => {
  try {
    const currentState = getState()

    if (!currentState.aiService) {
      throw new Error("AI service not initialized")
    }

    // Send initial response
    const response: ExtensionToWebViewMessage = {
      type: "chatResponse",
      payload: {
        id: `explain-${Date.now()}`,
        content: "",
        timestamp: Date.now(),
      },
    }
    webview.postMessage(response)

    // Get explanation from AI service
    const explanation = await currentState.aiService.explainCode(payload.selectedText, payload.language)

    // Send explanation response
    const finalResponse: ExtensionToWebViewMessage = {
      type: "chatResponse",
      payload: {
        id: `explain-${Date.now()}`,
        content: `**Code Explanation:**\n\n${explanation}`,
        timestamp: Date.now(),
      },
    }
    webview.postMessage(finalResponse)

  } catch (error) {
    const errorResponse: ExtensionToWebViewMessage = {
      type: "error",
      payload: {
        code: "EXPLAIN_ERROR",
        message: "Failed to explain code",
        details: { error: String(error) },
      },
    }
    webview.postMessage(errorResponse)
  }
}

const handleGenerateTestsRequest = async (payload: { selectedText: string; fileName: string; language: string; lineNumber: number }, webview: vscode.Webview): Promise<void> => {
  try {
    const currentState = getState()

    if (!currentState.aiService) {
      throw new Error("AI service not initialized")
    }

    // Send initial response
    const response: ExtensionToWebViewMessage = {
      type: "chatResponse",
      payload: {
        id: `tests-${Date.now()}`,
        content: "",
        timestamp: Date.now(),
      },
    }
    webview.postMessage(response)

    // Get tests from AI service
    const tests = await currentState.aiService.generateTests(payload.selectedText, payload.language)

    // Send tests response
    const finalResponse: ExtensionToWebViewMessage = {
      type: "chatResponse",
      payload: {
        id: `tests-${Date.now()}`,
        content: `**Generated Tests:**\n\n\`\`\`${payload.language}\n${tests}\n\`\`\``,
        timestamp: Date.now(),
      },
    }
    webview.postMessage(finalResponse)

  } catch (error) {
    const errorResponse: ExtensionToWebViewMessage = {
      type: "error",
      payload: {
        code: "TESTS_ERROR",
        message: "Failed to generate tests",
        details: { error: String(error) },
      },
    }
    webview.postMessage(errorResponse)
  }
}

const createInlineCompletionProvider = (): vscode.InlineCompletionItemProvider => ({
  async provideInlineCompletionItems(document, position, _context, token) {
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
      const completionPayload: CompletionPayload = {
        code: document.getText(),
        language,
        cursor: { line: position.line, character: position.character },
      }

      const completion = await getAICompletionFull(completionPayload)

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
      const completionPayload: CompletionPayload = {
        code: selectedText,
        language,
        cursor: { line: selection.active.line, character: selection.active.character },
      }

      const completion = await getAICompletionFull(completionPayload)

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

  // Get configuration
  const config = vscode.workspace.getConfiguration("ai-assistant")
  const apiKey = config.get<string>("apiKey") || process.env.OPENAI_API_KEY || process.env.AI_API_KEY
  const model = config.get<string>("model") || "gpt-4-turbo"
  const temperature = config.get<number>("temperature") || 0.7
  const maxTokens = config.get<number>("maxTokens") || 2000
  const provider = config.get<string>("provider") || "openai"

  if (!apiKey && provider === "openai") {
    vscode.window.showErrorMessage("AI Assistant: Please set your OpenAI API key in settings or environment variables.")
    return
  }

  // Initialize AI service
  const aiService = new AIService({
    provider: provider as "openai" | "local",
    model,
    apiKey,
    temperature,
    maxTokens,
  })

  setState({ aiService })

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
