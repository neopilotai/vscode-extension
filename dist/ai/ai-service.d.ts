import type { ChatMessage, CodeSuggestion } from "../types/messages";
import type { AIModelConfig } from "../types/messages";
/**
 * Service for handling AI operations
 */
export declare class AIService {
    private config;
    private conversationHistory;
    constructor(config: AIModelConfig);
    updateConfig(config: AIModelConfig): void;
    addToHistory(message: ChatMessage): void;
    clearHistory(): void;
    private buildPrompt;
    chat(userMessage: string): Promise<string>;
    chatStream(userMessage: string): AsyncGenerator<string, void, any>;
    getCompletion(code: string, language: string): Promise<string>;
    explainCode(code: string, language: string): Promise<string>;
    generateTests(code: string, language: string): Promise<string>;
    generateSuggestions(code: string, language: string): Promise<CodeSuggestion[]>;
}
//# sourceMappingURL=ai-service.d.ts.map