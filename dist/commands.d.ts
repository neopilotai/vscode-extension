import type { WebViewManager } from "./webview-manager";
/**
 * Handles VS Code commands
 */
export declare class CommandHandler {
    private webviewManager;
    constructor(webviewManager: WebViewManager);
    openChat(): Promise<void>;
    getCompletion(): Promise<void>;
    explainCode(): Promise<void>;
    generateTests(): Promise<void>;
}
//# sourceMappingURL=commands.d.ts.map