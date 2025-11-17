"use strict";
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebviewPanel = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const createWebviewPanel = (context) => {
    const panel = vscode.window.createWebviewPanel("aiAssistant", "AI Assistant", vscode.ViewColumn.Beside, {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "dist"))],
    });
    const webviewPath = vscode.Uri.file(path.join(context.extensionPath, "dist", "webview.html"));
    const webviewUri = panel.webview.asWebviewUri(webviewPath);
    panel.webview.html = getWebviewContent(webviewUri.toString());
    return panel;
};
exports.createWebviewPanel = createWebviewPanel;
const getWebviewContent = (scriptUri) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Assistant</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #1e1e1e;
        color: #e0e0e0;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      #root { flex: 1; display: flex; flex-direction: column; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="${scriptUri}"></script>
  </body>
  </html>
`;
//# sourceMappingURL=panel-manager.js.map