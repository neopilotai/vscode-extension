import * as vscode from "vscode"
import type { AIService } from "../ai/ai-service"

/**
 * Provides code lenses for AI suggestions
 */
export class AICodeLensProvider implements vscode.CodeLensProvider {
  private codeLenses: vscode.CodeLens[] = []
  private onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>()

  onDidChangeCodeLenses = this.onDidChangeCodeLensesEmitter.event

  constructor(private aiService: AIService) {
    vscode.workspace.onDidChangeTextDocument(() => {
      this.onDidChangeCodeLensesEmitter.fire()
    })
  }

  async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
    this.codeLenses = []

    // Add code lenses for functions and classes
    const regex = /^\s*(async\s+)?(function|class|const\s+\w+\s*=\s*(async\s*)?\()/gm
    let match

    while ((match = regex.exec(document.getText())) && !token.isCancellationRequested) {
      const line = document.lineAt(document.positionAt(match.index).line)
      const range = new vscode.Range(line.range.start, line.range.end)

      // Explain code lens
      const explainLens = new vscode.CodeLens(range, {
        title: "$(sparkle) Explain",
        command: "ai-assistant.explainCode",
        arguments: [document.uri, range],
      })

      // Generate tests lens
      const testsLens = new vscode.CodeLens(range, {
        title: "$(beaker) Generate Tests",
        command: "ai-assistant.generateTests",
        arguments: [document.uri, range],
      })

      // Get suggestions lens
      const suggestionsLens = new vscode.CodeLens(range, {
        title: "$(lightbulb) Suggestions",
        command: "ai-assistant.getSuggestions",
        arguments: [document.uri, range],
      })

      this.codeLenses.push(explainLens, testsLens, suggestionsLens)
    }

    return this.codeLenses
  }

  resolveCodeLens(codeLens: vscode.CodeLens): vscode.CodeLens {
    return codeLens
  }
}
