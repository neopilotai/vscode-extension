"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompletionConfig = exports.validateContent = exports.getTokenCount = exports.getAICompletionFull = exports.getAICompletion = void 0;
/**
 * Get configuration from environment variables or defaults
 */
const getConfig = () => ({
    provider: process.env.AI_PROVIDER || "openai",
    apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
    model: process.env.AI_MODEL || "gpt-4-turbo",
    baseUrl: process.env.AI_BASE_URL,
    temperature: Number.parseFloat(process.env.AI_TEMPERATURE || "0.7"),
    maxTokens: Number.parseInt(process.env.AI_MAX_TOKENS || "2048", 10),
    enableTokenCounting: process.env.AI_ENABLE_TOKEN_COUNTING !== "false",
    enableSafetyFilter: process.env.AI_ENABLE_SAFETY_FILTER !== "false",
});
/**
 * Estimate token count using simple heuristic (1 token ≈ 4 characters)
 * For production, use js-tiktoken library
 */
const estimateTokenCount = (text) => {
    return Math.ceil(text.length / 4);
};
/**
 * Check if content contains potentially harmful patterns
 */
const isSafeContent = (content) => {
    const harmfulPatterns = [
        /malware/i,
        /ransomware/i,
        /exploit/i,
        /vulnerability.*attack/i,
        /sql.*injection/i,
        /xss.*attack/i,
    ];
    return !harmfulPatterns.some((pattern) => pattern.test(content));
};
/**
 * Build completion prompt with code context
 */
const buildCompletionPrompt = (payload) => {
    const { code, language, cursor } = payload;
    const lines = code.split("\n");
    const currentLine = lines[cursor.line] || "";
    const beforeCursor = currentLine.substring(0, cursor.character);
    const afterCursor = currentLine.substring(cursor.character);
    // Get context lines (5 before and 5 after)
    const startLine = Math.max(0, cursor.line - 5);
    const endLine = Math.min(lines.length, cursor.line + 5);
    const contextLines = lines.slice(startLine, endLine);
    const contextCode = contextLines
        .map((line, idx) => {
        const lineNum = startLine + idx;
        const marker = lineNum === cursor.line ? ">>> " : "    ";
        return `${marker}${line}`;
    })
        .join("\n");
    return `Complete the following ${language} code. The cursor is at the position marked with >>>:

\`\`\`${language}
${contextCode}
\`\`\`

Current line before cursor: "${beforeCursor}"
Current line after cursor: "${afterCursor}"

Provide only the completion text that should be inserted at the cursor position, without any explanation or markdown formatting.`;
};
/**
 * Stream completion from OpenAI API
 */
async function* streamOpenAICompletion(prompt, config) {
    if (!config.apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    const url = `${config.baseUrl || "https://api.openai.com/v1"}/chat/completions`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: config.model,
            messages: [{ role: "user", content: prompt }],
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            stream: true,
        }),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }
    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("No response body from OpenAI API");
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
                    const data = line.slice(6).trim();
                    if (data === "[DONE]")
                        continue;
                    try {
                        const parsed = JSON.parse(data);
                        const chunk = parsed.choices?.[0]?.delta?.content || "";
                        if (chunk) {
                            yield chunk;
                        }
                    }
                    catch {
                        // Skip invalid JSON lines
                    }
                }
            }
        }
    }
    finally {
        reader.releaseLock();
    }
}
/**
 * Stream completion from local HTTP endpoint
 */
async function* streamLocalCompletion(prompt, config) {
    const baseUrl = config.baseUrl || "http://localhost:8000";
    const url = `${baseUrl}/v1/chat/completions`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: config.model,
            messages: [{ role: "user", content: prompt }],
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            stream: true,
        }),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Local API error: ${response.status} - ${error}`);
    }
    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("No response body from local API");
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
                    const data = line.slice(6).trim();
                    if (data === "[DONE]")
                        continue;
                    try {
                        const parsed = JSON.parse(data);
                        const chunk = parsed.choices?.[0]?.delta?.content || "";
                        if (chunk) {
                            yield chunk;
                        }
                    }
                    catch {
                        // Skip invalid JSON lines
                    }
                }
            }
        }
    }
    finally {
        reader.releaseLock();
    }
}
/**
 * Main completion function that returns an AsyncGenerator
 * Usage:
 *   for await (const chunk of getAICompletion({ code, language, cursor })) {
 *     console.log(chunk)
 *   }
 */
async function* getAICompletion(payload) {
    const config = getConfig();
    const prompt = buildCompletionPrompt(payload);
    const promptTokens = config.enableTokenCounting ? estimateTokenCount(prompt) : 0;
    if (config.enableTokenCounting && promptTokens > config.maxTokens) {
        throw new Error(`Prompt exceeds max tokens: ${promptTokens} > ${config.maxTokens}`);
    }
    if (config.enableSafetyFilter && !isSafeContent(payload.code)) {
        throw new Error("Code content failed safety check");
    }
    try {
        if (config.provider === "openai") {
            yield* streamOpenAICompletion(prompt, config);
        }
        else if (config.provider === "local") {
            yield* streamLocalCompletion(prompt, config);
        }
        else {
            throw new Error(`Unknown provider: ${config.provider}`);
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Completion failed: ${message}`);
    }
}
exports.getAICompletion = getAICompletion;
/**
 * Get full completion as a string (non-streaming)
 */
const getAICompletionFull = async (payload) => {
    let result = "";
    for await (const chunk of getAICompletion(payload)) {
        result += chunk;
    }
    return result;
};
exports.getAICompletionFull = getAICompletionFull;
/**
 * Get token count for a given text
 */
const getTokenCount = (text) => {
    return estimateTokenCount(text);
};
exports.getTokenCount = getTokenCount;
/**
 * Validate content against safety filters
 */
const validateContent = (content) => {
    return isSafeContent(content);
};
exports.validateContent = validateContent;
/**
 * Update configuration at runtime
 */
const updateCompletionConfig = (overrides) => {
    // Store in a module-level variable for runtime updates
    Object.assign(getConfig(), overrides);
};
exports.updateCompletionConfig = updateCompletionConfig;
//# sourceMappingURL=completion.js.map