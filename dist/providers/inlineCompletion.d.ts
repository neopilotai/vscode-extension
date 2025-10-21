/**
 * Functional inline completion provider for VS Code
 * Provides Copilot-like ghost text suggestions with debouncing
 * Uses AsyncGenerator for streaming completions
 */
/// <reference types="node" />
import * as vscode from "vscode";
/**
 * Main inline completion provider function
 * Returns a provider that can be registered with VS Code
 */
export declare const createInlineCompletionProvider: () => vscode.InlineCompletionItemProvider;
/**
 * Register the inline completion provider with VS Code
 * Functional registration without class instantiation
 */
export declare const registerInlineCompletionProvider: (context: vscode.ExtensionContext) => vscode.Disposable;
/**
 * Alternative: Create an inline completion provider with real-time updates
 * This version uses a different approach for better UX
 */
export declare const createAdvancedInlineCompletionProvider: (onCompletionUpdate?: ((items: vscode.InlineCompletionItem[]) => void) | undefined) => vscode.InlineCompletionItemProvider;
//# sourceMappingURL=inlineCompletion.d.ts.map