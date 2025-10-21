import type { WebViewManager } from "../webview-manager";
import type { AIService } from "./ai-service";
import type { ChatMessage } from "../types/messages";
/**
 * Handles streaming responses from AI service
 */
export declare class StreamingHandler {
    private webviewManager;
    private aiService;
    constructor(webviewManager: WebViewManager, aiService: AIService);
    handleChatStream(message: ChatMessage): Promise<void>;
    handleCompletion(code: string, language: string): Promise<void>;
    handleExplain(code: string, language: string): Promise<void>;
    handleGenerateTests(code: string, language: string): Promise<void>;
}
//# sourceMappingURL=streaming-handler.d.ts.map