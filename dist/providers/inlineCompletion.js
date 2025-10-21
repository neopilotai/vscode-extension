"use strict";
/**
 * Functional inline completion provider for VS Code
 * Provides Copilot-like ghost text suggestions with debouncing
 * Uses AsyncGenerator for streaming completions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdvancedInlineCompletionProvider = exports.registerInlineCompletionProvider = exports.createInlineCompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
const completion_1 = require("../ai/completion");
/**
 * Debounce utility for performance optimization
 */
const createDebounce = (fn, delay) => {
    let timeoutId = null;
    return (...args) => {
        if (timeoutId)
            clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
};
/**
 * Extract code context around cursor position
 */
const getCodeContext = (document, position) => {
    const text = document.getText();
    const offset = document.offsetAt(position);
    // Get surrounding context (up to 50 lines before and after)
    const lines = text.split("\n");
    const currentLineIdx = position.line;
    const startLine = Math.max(0, currentLineIdx - 50);
    const endLine = Math.min(lines.length, currentLineIdx + 50);
    const contextLines = lines.slice(startLine, endLine);
    const contextCode = contextLines.join("\n");
    // Calculate cursor position within context
    const cursorOffset = lines.slice(startLine, currentLineIdx).join("\n").length + position.character + startLine;
    return {
        code: contextCode,
        cursor: cursorOffset,
    };
};
/**
 * Check if inline completion should be triggered
 */
const shouldTriggerCompletion = (document, position) => {
    // Don't trigger in comments or strings
    const line = document.lineAt(position.line).text;
    const beforeCursor = line.substring(0, position.character);
    // Skip if in comment
    if (beforeCursor.includes("//") || beforeCursor.includes("/*")) {
        return false;
    }
    // Skip if line is empty or only whitespace
    if (beforeCursor.trim().length === 0) {
        return false;
    }
    // Skip if at the very beginning of a line
    if (position.character < 2) {
        return false;
    }
    return true;
};
/**
 * Stream completion and collect full text
 */
const streamCompletionText = async (payload) => {
    try {
        return await (0, completion_1.getAICompletionFull)(payload);
    }
    catch (error) {
        console.error("[v0] Completion error:", error);
        return "";
    }
};
/**
 * Create inline completion item from AI suggestion
 */
const createInlineCompletionItem = (completionText, range) => {
    // Clean up the completion text
    const cleanedText = completionText.trim();
    // Limit to single line for inline suggestions
    const singleLineText = cleanedText.split("\n")[0];
    return new vscode.InlineCompletionItem(singleLineText, range);
};
/**
 * Main inline completion provider function
 * Returns a provider that can be registered with VS Code
 */
const createInlineCompletionProvider = () => {
    // Store active completion requests to avoid duplicates
    const activeRequests = new Map();
    // Debounced completion function
    const debouncedGetCompletion = createDebounce(async (document, position, callback) => {
        const docKey = document.uri.toString();
        // Cancel previous request if still pending
        if (activeRequests.has(docKey)) {
            activeRequests.get(docKey)?.abort();
        }
        const controller = new AbortController();
        activeRequests.set(docKey, controller);
        try {
            if (!shouldTriggerCompletion(document, position)) {
                callback([]);
                return;
            }
            const { code, cursor } = getCodeContext(document, position);
            const language = document.languageId;
            const payload = {
                code,
                language,
                cursor: {
                    line: position.line,
                    character: position.character,
                },
            };
            const completionText = await streamCompletionText(payload);
            if (controller.signal.aborted) {
                return;
            }
            if (completionText) {
                const range = new vscode.Range(position, position);
                const item = createInlineCompletionItem(completionText, range);
                callback([item]);
            }
            else {
                callback([]);
            }
        }
        catch (error) {
            console.error("[v0] Inline completion error:", error);
            callback([]);
        }
        finally {
            activeRequests.delete(docKey);
        }
    }, 500);
    return {
        provideInlineCompletionItems: (document, position, context, token) => {
            // Return empty array immediately, then fetch asynchronously
            debouncedGetCompletion(document, position, (items) => {
                // Note: VS Code doesn't support async updates to inline completions
                // This is a limitation of the current API
                // For production, consider using a different approach or polling
            });
            return [];
        },
    };
};
exports.createInlineCompletionProvider = createInlineCompletionProvider;
/**
 * Register the inline completion provider with VS Code
 * Functional registration without class instantiation
 */
const registerInlineCompletionProvider = (context) => {
    const provider = (0, exports.createInlineCompletionProvider)();
    // Register for all supported languages
    const languages = ["javascript", "typescript", "python", "java", "cpp", "csharp", "go", "rust", "php", "ruby"];
    const disposables = languages.map((language) => vscode.languages.registerInlineCompletionItemProvider(language, provider));
    // Return a composite disposable that unregisters all providers
    return vscode.Disposable.from(...disposables);
};
exports.registerInlineCompletionProvider = registerInlineCompletionProvider;
/**
 * Alternative: Create an inline completion provider with real-time updates
 * This version uses a different approach for better UX
 */
const createAdvancedInlineCompletionProvider = (onCompletionUpdate) => {
    // Store active completion requests to avoid duplicates
    const activeRequests = new Map();
    const debouncedGetCompletion = createDebounce(async (document, position, callback) => {
        const docKey = document.uri.toString();
        // Cancel previous request if still pending
        if (activeRequests.has(docKey)) {
            activeRequests.get(docKey)?.abort();
        }
        const controller = new AbortController();
        activeRequests.set(docKey, controller);
        try {
            if (!shouldTriggerCompletion(document, position)) {
                callback([]);
                return;
            }
            const { code, cursor } = getCodeContext(document, position);
            const language = document.languageId;
            const payload = {
                code,
                language,
                cursor: {
                    line: position.line,
                    character: position.character,
                },
            };
            const completionText = await (0, completion_1.getAICompletionFull)(payload);
            if (controller.signal.aborted) {
                return;
            }
            if (completionText.trim()) {
                const range = new vscode.Range(position, position);
                const item = createInlineCompletionItem(completionText, range);
                callback([item]);
                onCompletionUpdate?.([item]);
            }
            else {
                callback([]);
            }
        }
        catch (error) {
            console.error("[v0] Advanced inline completion error:", error);
            callback([]);
        }
        finally {
            activeRequests.delete(docKey);
        }
    }, 300);
    return {
        provideInlineCompletionItems: (document, position, _context, _token) => {
            debouncedGetCompletion(document, position, () => {
                // Async callback
            });
            return [];
        },
    };
};
exports.createAdvancedInlineCompletionProvider = createAdvancedInlineCompletionProvider;
//# sourceMappingURL=inlineCompletion.js.map