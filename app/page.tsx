import { Code2, Sparkles, Zap, MessageSquare, Lightbulb, TestTube2 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AI Code Assistant</h1>
          </div>
          <p className="text-sm text-muted-foreground">VS Code Extension v0.1.0</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
          Your AI-Powered Code Assistant
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Enhance your coding workflow with intelligent code completions, explanations, test generation, and real-time
          suggestions powered by advanced AI models.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Install Extension
          </button>
          <button className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium">
            View Documentation
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-foreground mb-12 text-center">Key Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <MessageSquare className="w-8 h-8 text-primary mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">Chat Interface</h4>
            <p className="text-muted-foreground">
              Conversational AI assistant in your sidebar for quick questions and code discussions.
            </p>
          </div>

          {/* Code Completion */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <Code2 className="w-8 h-8 text-primary mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">Smart Completions</h4>
            <p className="text-muted-foreground">
              AI-powered code completions that understand context and suggest relevant code snippets.
            </p>
          </div>

          {/* Code Explanation */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <Lightbulb className="w-8 h-8 text-primary mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">Code Explanation</h4>
            <p className="text-muted-foreground">Get detailed explanations of any code snippet with a single click.</p>
          </div>

          {/* Test Generation */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <TestTube2 className="w-8 h-8 text-primary mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">Test Generation</h4>
            <p className="text-muted-foreground">Automatically generate comprehensive unit tests for your code.</p>
          </div>

          {/* Inline Suggestions */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">Inline Suggestions</h4>
            <p className="text-muted-foreground">
              Real-time code suggestions and improvements as you type with visual decorations.
            </p>
          </div>

          {/* Multi-Provider Support */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <Sparkles className="w-8 h-8 text-primary mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">Multi-Provider</h4>
            <p className="text-muted-foreground">
              Support for OpenAI, Anthropic, and other AI providers with easy configuration.
            </p>
          </div>
        </div>
      </section>

      {/* Commands Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-foreground mb-12 text-center">Available Commands</h3>
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <code className="bg-muted px-3 py-1 rounded text-sm font-mono text-primary flex-shrink-0">
                Ctrl+Shift+A
              </code>
              <div>
                <p className="font-semibold text-foreground">Open Chat</p>
                <p className="text-sm text-muted-foreground">Open the AI Assistant chat panel</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <code className="bg-muted px-3 py-1 rounded text-sm font-mono text-primary flex-shrink-0">
                Ctrl+Shift+I
              </code>
              <div>
                <p className="font-semibold text-foreground">Get Completion</p>
                <p className="text-sm text-muted-foreground">Get AI-powered code completion</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <code className="bg-muted px-3 py-1 rounded text-sm font-mono text-primary flex-shrink-0">
                Command Palette
              </code>
              <div>
                <p className="font-semibold text-foreground">Explain Code</p>
                <p className="text-sm text-muted-foreground">Get detailed explanation of selected code</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <code className="bg-muted px-3 py-1 rounded text-sm font-mono text-primary flex-shrink-0">
                Command Palette
              </code>
              <div>
                <p className="font-semibold text-foreground">Generate Tests</p>
                <p className="text-sm text-muted-foreground">Generate unit tests for selected code</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Configuration Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-foreground mb-12 text-center">Configuration</h3>
        <div className="bg-card border border-border rounded-lg p-8">
          <h4 className="text-lg font-semibold text-foreground mb-4">Settings</h4>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>
                <strong>ai-assistant.provider</strong> - Choose between OpenAI or Anthropic
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>
                <strong>ai-assistant.model</strong> - Select the AI model to use
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>
                <strong>ai-assistant.apiKey</strong> - Set your API key securely
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>
                <strong>ai-assistant.autoSuggest</strong> - Enable automatic suggestions while editing
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>
                <strong>ai-assistant.temperature</strong> - Control response creativity (0-2)
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>AI Code Assistant Extension • Built with TypeScript, React, and VS Code API</p>
          <p className="text-sm mt-2">© 2025 AI Assistant. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
