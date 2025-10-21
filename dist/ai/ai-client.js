"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIClientFactory = exports.AnthropicClient = exports.OpenAIClient = exports.BaseAIClient = void 0;
/**
 * Base AI client for handling different AI providers
 */
class BaseAIClient {
    constructor(config) {
        this.config = config;
    }
    validateConfig() {
        if (!this.config.model) {
            throw new Error("Model not configured");
        }
    }
}
exports.BaseAIClient = BaseAIClient;
/**
 * OpenAI client implementation
 */
class OpenAIClient extends BaseAIClient {
    constructor(config) {
        super(config);
        this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || "";
        if (!this.apiKey) {
            throw new Error("OpenAI API key not configured");
        }
    }
    async generateCompletion(prompt, options) {
        this.validateConfig();
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [{ role: "user", content: prompt }],
                temperature: this.config.temperature ?? 0.7,
                max_tokens: this.config.maxTokens ?? 2000,
            }),
        });
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        const data = (await response.json());
        return data.choices[0].message.content;
    }
    async *streamCompletion(prompt, options) {
        this.validateConfig();
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [{ role: "user", content: prompt }],
                temperature: this.config.temperature ?? 0.7,
                max_tokens: this.config.maxTokens ?? 2000,
                stream: true,
            }),
            signal: options?.signal,
        });
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("No response body");
        }
        const decoder = new TextDecoder();
        let buffer = "";
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        if (data === "[DONE]") {
                            options?.onComplete?.();
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                options?.onChunk?.(content);
                                yield content;
                            }
                        }
                        catch {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }
        }
        catch (error) {
            options?.onError?.(error);
            throw error;
        }
        finally {
            reader.releaseLock();
        }
    }
}
exports.OpenAIClient = OpenAIClient;
/**
 * Anthropic Claude client implementation
 */
class AnthropicClient extends BaseAIClient {
    constructor(config) {
        super(config);
        this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || "";
        if (!this.apiKey) {
            throw new Error("Anthropic API key not configured");
        }
    }
    async generateCompletion(prompt, options) {
        this.validateConfig();
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: this.config.model,
                max_tokens: this.config.maxTokens ?? 2000,
                messages: [{ role: "user", content: prompt }],
            }),
        });
        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.statusText}`);
        }
        const data = (await response.json());
        return data.content[0].text;
    }
    async *streamCompletion(prompt, options) {
        this.validateConfig();
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: this.config.model,
                max_tokens: this.config.maxTokens ?? 2000,
                messages: [{ role: "user", content: prompt }],
                stream: true,
            }),
            signal: options?.signal,
        });
        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.statusText}`);
        }
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("No response body");
        }
        const decoder = new TextDecoder();
        let buffer = "";
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                                options?.onChunk?.(parsed.delta.text);
                                yield parsed.delta.text;
                            }
                            else if (parsed.type === "message_stop") {
                                options?.onComplete?.();
                                return;
                            }
                        }
                        catch {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }
        }
        catch (error) {
            options?.onError?.(error);
            throw error;
        }
        finally {
            reader.releaseLock();
        }
    }
}
exports.AnthropicClient = AnthropicClient;
/**
 * Factory for creating AI clients
 */
class AIClientFactory {
    static create(config) {
        switch (config.provider) {
            case "openai":
                return new OpenAIClient(config);
            case "anthropic":
                return new AnthropicClient(config);
            default:
                throw new Error(`Unsupported AI provider: ${config.provider}`);
        }
    }
}
exports.AIClientFactory = AIClientFactory;
//# sourceMappingURL=ai-client.js.map