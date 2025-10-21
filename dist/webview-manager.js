"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebViewManager = void 0;
/**
 * Manages WebView communication and state
 */
class WebViewManager {
    constructor() {
        this.webviews = new Set();
        this.messageHandlers = new Map();
        this.setupMessageHandlers();
    }
    registerWebview(webview) {
        this.webviews.add(webview);
    }
    async handleMessage(message) {
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
            try {
                // Only pass payload if the message has one
                const payload = "payload" in message ? message.payload : undefined;
                await handler(payload);
            }
            catch (error) {
                console.error(`Error handling message type ${message.type}:`, error);
                this.broadcastMessage({
                    type: "error",
                    payload: {
                        code: "HANDLER_ERROR",
                        message: `Failed to process ${message.type}`,
                        details: { error: String(error) },
                    },
                });
            }
        }
    }
    broadcastMessage(message) {
        this.webviews.forEach((webview) => {
            webview.postMessage(message);
        });
    }
    setupMessageHandlers() {
        this.messageHandlers.set("ready", async () => {
            console.log("WebView is ready");
        });
        this.messageHandlers.set("chat", async (payload) => {
            console.log("Chat message received:", payload);
            // Will be handled by AI client
        });
        this.messageHandlers.set("getCompletion", async (payload) => {
            console.log("Completion request:", payload);
            // Will be handled by AI client
        });
        this.messageHandlers.set("explainCode", async (payload) => {
            console.log("Explain code request:", payload);
            // Will be handled by AI client
        });
        this.messageHandlers.set("generateTests", async (payload) => {
            console.log("Generate tests request:", payload);
            // Will be handled by AI client
        });
        this.messageHandlers.set("applyEdit", async (payload) => {
            console.log("Apply edit request:", payload);
            // Will be handled by command handler
        });
    }
}
exports.WebViewManager = WebViewManager;
//# sourceMappingURL=webview-manager.js.map