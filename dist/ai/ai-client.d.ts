import type { AIModelConfig, AIStreamOptions } from "../types/messages";
/**
 * Base AI client for handling different AI providers
 */
export declare abstract class BaseAIClient {
    protected config: AIModelConfig;
    constructor(config: AIModelConfig);
    abstract generateCompletion(prompt: string, options?: AIStreamOptions): Promise<string>;
    abstract streamCompletion(prompt: string, options?: AIStreamOptions): AsyncGenerator<string>;
    protected validateConfig(): void;
}
/**
 * OpenAI client implementation
 */
export declare class OpenAIClient extends BaseAIClient {
    private apiKey;
    constructor(config: AIModelConfig);
    generateCompletion(prompt: string, _options?: AIStreamOptions): Promise<string>;
    streamCompletion(prompt: string, options?: AIStreamOptions): AsyncGenerator<string>;
}
/**
 * Anthropic Claude client implementation
 */
export declare class AnthropicClient extends BaseAIClient {
    private apiKey;
    constructor(config: AIModelConfig);
    generateCompletion(prompt: string, _options?: AIStreamOptions): Promise<string>;
    streamCompletion(prompt: string, _options?: AIStreamOptions): AsyncGenerator<string>;
}
/**
 * Factory for creating AI clients
 */
export declare class AIClientFactory {
    static create(config: AIModelConfig): BaseAIClient;
}
//# sourceMappingURL=ai-client.d.ts.map