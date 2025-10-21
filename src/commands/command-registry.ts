import * as vscode from "vscode"

interface CommandHandlers {
  openChat: () => void
  getCompletion: () => void
  explainCode: () => void
  generateTests: () => void
}

export const registerCommands = (context: vscode.ExtensionContext, handlers: CommandHandlers): void => {
  context.subscriptions.push(
    vscode.commands.registerCommand("ai-assistant.openChat", handlers.openChat),
    vscode.commands.registerCommand("ai-assistant.getCompletion", handlers.getCompletion),
    vscode.commands.registerCommand("ai-assistant.explainCode", handlers.explainCode),
    vscode.commands.registerCommand("ai-assistant.generateTests", handlers.generateTests),
  )
}
