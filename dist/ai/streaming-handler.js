"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingHandler = void 0;
/**
 * Handles streaming responses from AI service
 */
class StreamingHandler {
    constructor(webviewManager, aiService) {
        this.webviewManager = webviewManager;
        this.aiService = aiService;
    }
    async handleChatStream(message) {
        const responseId = `response-${Date.now()}`;
        let fullContent = "";
        try {
            for await (const chunk of this.aiService.chatStream(message.content)) {
                fullContent += chunk;
                // Send stream chunk to WebView
                this.webviewManager.broadcastMessage({
                    type: "streamChunk",
                    payload: {
                        id: responseId,
                        chunk,
                        isComplete: false,
                    },
                });
            }
            // Send final response
            this.webviewManager.broadcastMessage({
                type: "chatResponse",
                payload: {
                    id: responseId,
                    content: fullContent,
                    timestamp: Date.now(),
                },
            });
            // Add to history
            this.aiService.addToHistory({
                id: responseId,
                role: "assistant",
                content: fullContent,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            this.webviewManager.broadcastMessage({
                type: "error",
                payload: {
                    code: "STREAM_ERROR",
                    message: "Failed to stream response",
                    details: { error: String(error) },
                },
            });
        }
    }
    async handleCompletion(code, language) {
        try {
            const completion = await this.aiService.getCompletion(code, language);
            this.webviewManager.broadcastMessage({
                type: "completionResponse",
                payload: {
                    completions: [
                        {
                            label: "AI Completion",
                            insertText: completion,
                            kind: "snippet",
                        },
                    ],
                },
            });
        }
        catch (error) {
            this.webviewManager.broadcastMessage({
                type: "error",
                payload: {
                    code: "COMPLETION_ERROR",
                    message: "Failed to generate completion",
                    details: { error: String(error) },
                },
            });
        }
    }
    async handleExplain(code, language) {
        const responseId = `explain-${Date.now()}`;
        try {
            const explanation = await this.aiService.explainCode(code, language);
            this.webviewManager.broadcastMessage({
                type: "chatResponse",
                payload: {
                    id: responseId,
                    content: explanation,
                    timestamp: Date.now(),
                },
            });
        }
        catch (error) {
            this.webviewManager.broadcastMessage({
                type: "error",
                payload: {
                    code: "EXPLAIN_ERROR",
                    message: "Failed to explain code",
                    details: { error: String(error) },
                },
            });
        }
    }
    async handleGenerateTests(code, language) {
        const responseId = `tests-${Date.now()}`;
        try {
            const tests = await this.aiService.generateTests(code, language);
            this.webviewManager.broadcastMessage({
                type: "chatResponse",
                payload: {
                    id: responseId,
                    content: tests,
                    timestamp: Date.now(),
                    suggestions: [
                        {
                            id: "test-suggestion",
                            type: "snippet",
                            title: "Generated Tests",
                            description: "Unit tests for the selected code",
                            code: tests,
                            startLine: 0,
                            endLine: tests.split("\n").length,
                            language,
                        },
                    ],
                },
            });
        }
        catch (error) {
            this.webviewManager.broadcastMessage({
                type: "error",
                payload: {
                    code: "TEST_ERROR",
                    message: "Failed to generate tests",
                    details: { error: String(error) },
                },
            });
        }
    }
}
exports.StreamingHandler = StreamingHandler;
//# sourceMappingURL=streaming-handler.js.map