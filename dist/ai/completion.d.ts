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
    maxRetries: number;
    retryDelay: number;
}
/**
 * Main completion function that returns an AsyncGenerator
 *
 * Usage:
 *   for await (const chunk of getAICompletion({ code, language, cursor })) {
 *     console.log(chunk)
 *   }
 *
 * @param payload - Completion request with code, language, and cursor position
 * @returns AsyncGenerator yielding completion chunks as strings
 */
export declare function getAICompletion(payload: CompletionPayload): AsyncGenerator<string>;
/**
 * Get full completion as a string (non-streaming)
 * Convenience function that collects all chunks into a single string
 */
export declare const getAICompletionFull: (payload: CompletionPayload) => Promise<string>;
/**
 * Get estimated token count for a given text
 * Useful for checking if content fits within model limits
 */
export declare const getTokenCount: (text: string) => number;
/**
 * Validate content against safety filters
 * Returns true if content passes all safety checks
 */
export declare const validateContent: (content: string) => boolean;
/**
 * Check if a language is supported by the completion system
 */
export declare const isLanguageSupported: (language: string) => boolean;
/**
 * Update configuration at runtime
 * Useful for VSCode settings changes
 */
export declare const updateCompletionConfig: (overrides: Partial<CompletionConfig>) => void;
/**
 * Get current configuration (without sensitive data)
 */
export declare const getCompletionConfig: () => Omit<CompletionConfig, "apiKey">;
export {};
//# sourceMappingURL=completion.d.ts.map