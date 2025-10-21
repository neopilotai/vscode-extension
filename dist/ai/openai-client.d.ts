import type { AIConfig, CompletionOptions, CompletionResult, StreamCallback, ErrorCallback } from "../types/ai";
export declare const createOpenAIClient: (config: AIConfig) => {
    generateCompletion: (options: CompletionOptions) => Promise<CompletionResult>;
    streamCompletion: (options: CompletionOptions, onChunk: StreamCallback, onError: ErrorCallback) => Promise<void>;
};
//# sourceMappingURL=openai-client.d.ts.map