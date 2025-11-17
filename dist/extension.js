"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path_1 = __importDefault(require("path"));
const completion_1 = require("./ai/completion");
const ai_service_1 = require("./ai/ai-service");
// ============================================================================
// State Management (Functional)
// ============================================================================
let state = {
    context: null,
    webviewPanel: undefined,
    inlineCompletionDisposable: undefined,
    aiService: undefined,
};
const setState = (updates) => {
    state = { ...state, ...updates };
};
const getState = () => state;
// ============================================================================
// WebView Content Generation
// ============================================================================
const getWebviewContent = (webview, extensionUri) => {
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(path_1.default.join(extensionUri.fsPath, "dist", "webview", "index.js")));
    const styleUri = webview.asWebviewUri(vscode.Uri.file(path_1.default.join(extensionUri.fsPath, "dist", "webview", "style.css")));
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
</html>`;
};
// ============================================================================
// WebView Panel Management
// ============================================================================
const createWebviewPanel = (context) => {
    const panel = vscode.window.createWebviewPanel("aiAssistant", "AI Coding Assistant", vscode.ViewColumn.Beside, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path_1.default.join(context.extensionUri.fsPath, "dist"))],
    });
    panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
    return panel;
};
const openAssistantPanel = (context) => {
    const currentState = getState();
    if (currentState.webviewPanel) {
        currentState.webviewPanel.reveal(vscode.ViewColumn.Beside);
        return;
    }
    const panel = createWebviewPanel(context);
    setState({ webviewPanel: panel });
    // Handle messages from WebView
    panel.webview.onDidReceiveMessage((message) => {
        handleWebViewMessage(message, panel.webview);
    }, undefined, context.subscriptions);
    // Handle panel disposal
    panel.onDidDispose(() => {
        setState({ webviewPanel: undefined });
    }, undefined, context.subscriptions);
};
// ============================================================================
// Message Handling
// ============================================================================
const handleWebViewMessage = async (message, webview) => {
    const currentState = getState();
    switch (message.type) {
        case "getCompletion": {
            await handleCompletionRequest(message.payload, webview);
            break;
        }
        case "chat": {
            await handleChatRequest(message.payload, webview);
            break;
        }
        case "explainCode": {
            await handleExplainCodeRequest(message.payload, webview);
            break;
        }
        case "generateTests": {
            await handleGenerateTestsRequest(message.payload, webview);
            break;
        }
        case "applyEdit": {
            await handleApplyEdit(message.payload, webview);
            break;
        }
        case "ready": {
            console.log("[AI Assistant] WebView is ready");
            break;
        }
    }
};
const handleCompletionRequest = async (payload, webview) => {
    try {
        // Transform CompletionRequest to CompletionPayload
        const completionPayload = {
            code: payload.context,
            language: payload.language,
            cursor: payload.position,
        };
        const completion = await (0, completion_1.getAICompletionFull)(completionPayload);
        // Send completion response
        const response = {
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
        };
        webview.postMessage(response);
    }
    catch (error) {
        const errorResponse = {
            type: "error",
            payload: {
                code: "COMPLETION_ERROR",
                message: "Failed to generate completion",
                details: { error: String(error) },
            },
        };
        webview.postMessage(errorResponse);
    }
};
const handleChatRequest = async (payload, webview) => {
    try {
        const currentState = getState();
        if (!currentState.aiService) {
            throw new Error("AI service not initialized");
        }
        // Add user message to conversation history
        currentState.aiService.addToHistory({
            id: payload.id,
            role: "user",
            content: payload.content,
            timestamp: Date.now(),
            codeContext: payload.codeContext,
        });
        // Send initial response to indicate AI is thinking
        const response = {
            type: "chatResponse",
            payload: {
                id: `response-${Date.now()}`,
                content: "",
                timestamp: Date.now(),
            },
        };
        webview.postMessage(response);
        // Stream the AI response
        let fullContent = "";
        const messageId = `response-${Date.now()}`;
        for await (const chunk of currentState.aiService.chatStream(payload.content)) {
            fullContent += chunk;
            // Send streaming chunk to WebView
            const streamMessage = {
                type: "streamChunk",
                payload: {
                    id: messageId,
                    chunk,
                    isComplete: false,
                },
            };
            webview.postMessage(streamMessage);
        }
        // Send final response
        const finalResponse = {
            type: "chatResponse",
            payload: {
                id: messageId,
                content: fullContent,
                timestamp: Date.now(),
            },
        };
        webview.postMessage(finalResponse);
        // Add assistant message to conversation history
        currentState.aiService.addToHistory({
            id: messageId,
            role: "assistant",
            content: fullContent,
            timestamp: Date.now(),
        });
    }
    catch (error) {
        const errorResponse = {
            type: "error",
            payload: {
                code: "CHAT_ERROR",
                message: "Failed to generate chat response",
                details: { error: String(error) },
            },
        };
        webview.postMessage(errorResponse);
    }
};
const handleExplainCodeRequest = async (payload, webview) => {
    try {
        const currentState = getState();
        if (!currentState.aiService) {
            throw new Error("AI service not initialized");
        }
        // Send initial response
        const response = {
            type: "chatResponse",
            payload: {
                id: `explain-${Date.now()}`,
                content: "",
                timestamp: Date.now(),
            },
        };
        webview.postMessage(response);
        // Get explanation from AI service
        const explanation = await currentState.aiService.explainCode(payload.selectedText, payload.language);
        // Send explanation response
        const finalResponse = {
            type: "chatResponse",
            payload: {
                id: `explain-${Date.now()}`,
                content: `**Code Explanation:**\n\n${explanation}`,
                timestamp: Date.now(),
            },
        };
        webview.postMessage(finalResponse);
    }
    catch (error) {
        const errorResponse = {
            type: "error",
            payload: {
                code: "EXPLAIN_ERROR",
                message: "Failed to explain code",
                details: { error: String(error) },
            },
        };
        webview.postMessage(errorResponse);
    }
};
const handleGenerateTestsRequest = async (payload, webview) => {
    try {
        const currentState = getState();
        if (!currentState.aiService) {
            throw new Error("AI service not initialized");
        }
        // Send initial response
        const response = {
            type: "chatResponse",
            payload: {
                id: `tests-${Date.now()}`,
                content: "",
                timestamp: Date.now(),
            },
        };
        webview.postMessage(response);
        // Get tests from AI service
        const tests = await currentState.aiService.generateTests(payload.selectedText, payload.language);
        // Send tests response
        const finalResponse = {
            type: "chatResponse",
            payload: {
                id: `tests-${Date.now()}`,
                content: `**Generated Tests:**\n\n\`\`\`${payload.language}\n${tests}\n\`\`\``,
                timestamp: Date.now(),
            },
        };
        webview.postMessage(finalResponse);
    }
    catch (error) {
        const errorResponse = {
            type: "error",
            payload: {
                code: "TESTS_ERROR",
                message: "Failed to generate tests",
                details: { error: String(error) },
            },
        };
        webview.postMessage(errorResponse);
    }
};
const handleApplyEdit = async (payload, webview) => {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.fileName !== payload.fileName) {
            throw new Error("File not found in active editor");
        }
        const startPos = new vscode.Position(payload.startLine, 0);
        const endPos = new vscode.Position(payload.endLine, 0);
        const range = new vscode.Range(startPos, endPos);
        await editor.edit((editBuilder) => {
            editBuilder.replace(range, payload.newCode);
        });
        const response = {
            type: "editApplied",
            payload: {
                success: true,
                message: "Code edit applied successfully",
                fileName: payload.fileName,
                appliedLines: { start: payload.startLine, end: payload.endLine },
            },
        };
        webview.postMessage(response);
    }
    catch (error) {
        const errorResponse = {
            type: "error",
            payload: {
                code: "EDIT_ERROR",
                message: "Failed to apply code edit",
                details: { error: String(error) },
            },
        };
        webview.postMessage(errorResponse);
    }
};
const createInlineCompletionProvider = () => {
    return {
        async provideInlineCompletionItems(document, position, _context, token) {
            const line = document.lineAt(position.line);
            const lineText = line.text.substring(0, position.character);
            const language = document.languageId;
            // Supported languages for inline completions
            const supportedLanguages = ["javascript", "typescript", "python", "java", "cpp", "csharp", "go", "rust"];
            if (!supportedLanguages.includes(language)) {
                return [];
            }
            // Skip completions for comments
            if (lineText.trim().startsWith("//") || lineText.trim().startsWith("#")) {
                return [];
            }
            // Skip if token is cancelled
            if (token.isCancellationRequested) {
                return [];
            }
            try {
                const completionPayload = {
                    code: document.getText(),
                    language,
                    cursor: { line: position.line, character: position.character },
                };
                const completion = await (0, completion_1.getAICompletionFull)(completionPayload);
                return [new vscode.InlineCompletionItem(completion, new vscode.Range(position, position))];
            }
            catch (error) {
                console.error("[AI Assistant] Inline completion error:", error);
                return [];
            }
        },
    };
};
const registerInlineCompletionProvider = (context) => {
    const provider = createInlineCompletionProvider();
    const disposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);
    setState({ inlineCompletionDisposable: disposable });
    context.subscriptions.push(disposable);
};
// ============================================================================
// Command Registration
// ============================================================================
const registerCommand = (context, commandId, handler) => {
    const disposable = vscode.commands.registerCommand(commandId, handler);
    context.subscriptions.push(disposable);
};
const registerCommands = (context) => {
    // Main command to start the assistant
    registerCommand(context, "ai.assistant.start", () => {
        openAssistantPanel(context);
    });
    // Get completion command
    registerCommand(context, "ai.assistant.getCompletion", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        const language = editor.document.languageId;
        if (!selectedText) {
            vscode.window.showErrorMessage("Please select code to complete");
            return;
        }
        try {
            const completionPayload = {
                code: selectedText,
                language,
                cursor: { line: selection.active.line, character: selection.active.character },
            };
            const completion = await (0, completion_1.getAICompletionFull)(completionPayload);
            await editor.edit((editBuilder) => {
                editBuilder.insert(selection.end, "\n" + completion);
            });
            vscode.window.showInformationMessage("Completion inserted successfully");
        }
        catch (error) {
            vscode.window.showErrorMessage(`Completion failed: ${String(error)}`);
        }
    });
    // Explain code command
    registerCommand(context, "ai.assistant.explainCode", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selectedText) {
            vscode.window.showErrorMessage("Please select code to explain");
            return;
        }
        openAssistantPanel(context);
    });
    // Generate tests command
    registerCommand(context, "ai.assistant.generateTests", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor");
            return;
        }
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selectedText) {
            vscode.window.showErrorMessage("Please select code to test");
            return;
        }
        openAssistantPanel(context);
    });
};
// ============================================================================
// Extension Lifecycle
// ============================================================================
const activate = (context) => {
    console.log("[AI Assistant] Extension activated");
    setState({ context });
    // Get configuration
    const config = vscode.workspace.getConfiguration("ai-assistant");
    const apiKey = config.get("apiKey") || process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    const model = config.get("model") || "gpt-4-turbo";
    const temperature = config.get("temperature") || 0.7;
    const maxTokens = config.get("maxTokens") || 2000;
    const provider = config.get("provider") || "openai";
    const maxRetries = config.get("maxRetries") || 3;
    const retryDelay = config.get("retryDelay") || 1000;
    const enableTokenCounting = config.get("enableTokenCounting") !== false;
    const enableSafetyFilter = config.get("enableSafetyFilter") !== false;
    const localEndpoint = config.get("localEndpoint") || "http://localhost:8000";
    if (!apiKey && provider === "openai") {
        vscode.window.showErrorMessage("AI Assistant: Please set your OpenAI API key in settings or environment variables.");
        return;
    }
    // Set environment variables from VSCode configuration for completion utilities
    process.env.AI_PROVIDER = provider;
    process.env.OPENAI_API_KEY = apiKey;
    process.env.AI_API_KEY = apiKey;
    process.env.AI_MODEL = model;
    process.env.AI_TEMPERATURE = temperature.toString();
    process.env.AI_MAX_TOKENS = maxTokens.toString();
    process.env.AI_BASE_URL = localEndpoint;
    process.env.AI_MAX_RETRIES = maxRetries.toString();
    process.env.AI_RETRY_DELAY = retryDelay.toString();
    process.env.AI_ENABLE_TOKEN_COUNTING = enableTokenCounting.toString();
    process.env.AI_ENABLE_SAFETY_FILTER = enableSafetyFilter.toString();
    // Initialize AI service
    const aiService = new ai_service_1.AIService({
        provider: provider,
        model,
        apiKey,
        temperature,
        maxTokens,
    });
    setState({ aiService });
    // Register all commands
    registerCommands(context);
    // Register inline completion provider
    registerInlineCompletionProvider(context);
    console.log("[AI Assistant] All commands and providers registered");
};
exports.activate = activate;
const deactivate = () => {
    console.log("[AI Assistant] Extension deactivated");
    const currentState = getState();
    if (currentState.inlineCompletionDisposable) {
        currentState.inlineCompletionDisposable.dispose();
    }
    if (currentState.webviewPanel) {
        currentState.webviewPanel.dispose();
    }
};
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map