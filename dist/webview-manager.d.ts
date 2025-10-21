import type * as vscode from "vscode";
import type { WebViewToExtensionMessage, ExtensionToWebViewMessage } from "./types/messages";
/**
 * Manages WebView communication and state
 */
export declare class WebViewManager {
    private webviews;
    private messageHandlers;
    constructor();
    registerWebview(webview: vscode.Webview): void;
    handleMessage(message: WebViewToExtensionMessage): Promise<void>;
    broadcastMessage(message: ExtensionToWebViewMessage): void;
    private setupMessageHandlers;
}
//# sourceMappingURL=webview-manager.d.ts.map