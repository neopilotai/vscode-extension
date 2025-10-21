import * as vscode from "vscode"
import * as path from "path"

export const createWebviewPanel = (context: vscode.ExtensionContext): vscode.WebviewPanel => {
  const panel = vscode.window.createWebviewPanel("aiAssistant", "AI Assistant", vscode.ViewColumn.Beside, {
    enableScripts: true,
    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "dist"))],
  })

  const webviewPath = vscode.Uri.file(path.join(context.extensionPath, "dist", "webview.html"))
  const webviewUri = panel.webview.asWebviewUri(webviewPath)

  panel.webview.html = getWebviewContent(webviewUri.toString())

  return panel
}

const getWebviewContent = (scriptUri: string): string => `
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
`
