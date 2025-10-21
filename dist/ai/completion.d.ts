/**
 * Completion request payload
 */
export interface CompletionPayload {
    code: string;
    language: string;
    cursor: {
        line: number;
        character: number;
    };
}
/**
 * Configuration for completion service
 */
interface CompletionConfig {
    provider: "openai" | "local";
    apiKey?: string;
    model: string;
    baseUrl?: string;
    temperature: number;
    maxTokens: number;
    enableTokenCounting: boolean;
    enableSafetyFilter: boolean;
}
/**
 * Main completion function that returns an AsyncGenerator
 * Usage:
 *   for await (const chunk of getAICompletion({ code, language, cursor })) {
 *     console.log(chunk)
 *   }
 */
export declare function getAICompletion(payload: CompletionPayload): AsyncGenerator<string>;
/**
 * Get full completion as a string (non-streaming)
 */
export declare const getAICompletionFull: (payload: CompletionPayload) => Promise<string>;
/**
 * Get token count for a given text
 */
export declare const getTokenCount: (text: string) => number;
/**
 * Validate content against safety filters
 */
export declare const validateContent: (content: string) => boolean;
/**
 * Update configuration at runtime
 */
export declare const updateCompletionConfig: (overrides: Partial<CompletionConfig>) => void;
export {};
//# sourceMappingURL=completion.d.ts.map