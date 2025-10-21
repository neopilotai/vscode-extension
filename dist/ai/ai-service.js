"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const ai_client_1 = require("./ai-client");
/**
 * Service for handling AI operations
 */
class AIService {
    constructor(config) {
        this.conversationHistory = [];
        this.config = config;
    }
    updateConfig(config) {
        this.config = config;
    }
    addToHistory(message) {
        this.conversationHistory.push(message);
    }
    clearHistory() {
        this.conversationHistory = [];
    }
    buildPrompt(userMessage) {
        const context = this.conversationHistory
            .slice(-5) // Last 5 messages for context
            .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
            .join("\n");
        return context ? `${context}\nUser: ${userMessage}` : userMessage;
    }
    async chat(userMessage) {
        const client = ai_client_1.AIClientFactory.create(this.config);
        const prompt = this.buildPrompt(userMessage);
        return await client.generateCompletion(prompt);
    }
    async *chatStream(userMessage) {
        const client = ai_client_1.AIClientFactory.create(this.config);
        const prompt = this.buildPrompt(userMessage);
        yield* client.streamCompletion(prompt);
    }
    async getCompletion(code, language) {
        const client = ai_client_1.AIClientFactory.create(this.config);
        const prompt = `Complete the following ${language} code:\n\n${code}\n\nProvide only the completion without explanation.`;
        return await client.generateCompletion(prompt);
    }
    async explainCode(code, language) {
        const client = ai_client_1.AIClientFactory.create(this.config);
        const prompt = `Explain the following ${language} code in detail:\n\n${code}`;
        return await client.generateCompletion(prompt);
    }
    async generateTests(code, language) {
        const client = ai_client_1.AIClientFactory.create(this.config);
        const prompt = `Generate comprehensive unit tests for the following ${language} code:\n\n${code}\n\nProvide only the test code without explanation.`;
        return await client.generateCompletion(prompt);
    }
    async generateSuggestions(code, language) {
        const client = ai_client_1.AIClientFactory.create(this.config);
        const prompt = `Analyze the following ${language} code and provide 2-3 suggestions for improvement (refactoring, optimization, or bug fixes). Format as JSON array with objects containing: type (completion|refactor|bugFix|optimization), title, description, code, startLine, endLine.\n\n${code}`;
        const response = await client.generateCompletion(prompt);
        try {
            const suggestions = JSON.parse(response);
            return suggestions.map((s, i) => ({
                ...s,
                id: `suggestion-${i}`,
                language,
            }));
        }
        catch {
            return [];
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai-service.js.map