# AI VSCode Extension

A production-ready VS Code Extension that integrates AI code completions, inline suggestions, and contextual chat directly into your editor.

## Features

- **Chat Interface**: Real-time chat with AI assistant in a dedicated sidebar
- **Code Completions**: Get intelligent code suggestions with streaming support
- **Inline Decorations**: Visual suggestions directly in the editor
- **Code Explanation**: Understand complex code with AI-powered explanations
- **Test Generation**: Automatically generate unit tests for selected code
- **Type-Safe Messaging**: Robust host ↔ webview communication protocol

## Architecture

\`\`\`
/src
  ├── extension.ts           # Main extension entry point
  ├── types/
  │   ├── messages.ts        # Type-safe message protocol
  │   └── ai.ts              # AI model types
  ├── utils/
  │   ├── message-handler.ts # Message utilities
  │   ├── context-extractor.ts # Editor context extraction
  │   └── decoration-manager.ts # Inline decorations
  ├── ai/
  │   └── openai-client.ts   # OpenAI API client with streaming
  ├── commands/
  │   └── command-registry.ts # VS Code command registration
  ├── handlers/
  │   └── message-handler.ts # Message routing
  └── webview/
      └── panel-manager.ts   # Webview panel creation

/webview-src
  ├── main.tsx               # React entry point
  ├── components/
  │   ├── chat-interface.tsx # Main chat UI
  │   ├── message-list.tsx   # Message display
  │   ├── input-box.tsx      # Chat input
  │   └── suggestion-panel.tsx # Suggestions display
  ├── store/
  │   └── chat-store.ts      # Zustand state management
  └── styles/
      └── index.css          # VS Code themed styles
\`\`\`

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set your OpenAI API key:
   \`\`\`bash
   export OPENAI_API_KEY=your_key_here
   \`\`\`

3. Build the extension:
   \`\`\`bash
   npm run build
   \`\`\`

4. Run in development:
   \`\`\`bash
   npm run dev
   \`\`\`

## Configuration

Add to your VS Code settings:

\`\`\`json
{
  "ai-assistant.apiKey": "your-openai-key",
  "ai-assistant.model": "gpt-4",
  "ai-assistant.temperature": 0.7,
  "ai-assistant.maxTokens": 2000
}
\`\`\`

## Commands

- `Ctrl+Shift+A` (Cmd+Shift+A on Mac): Open AI Chat
- `Ctrl+Shift+I` (Cmd+Shift+I on Mac): Get Code Completion
- `AI Assistant: Explain Code`: Explain selected code
- `AI Assistant: Generate Tests`: Generate unit tests

## Design Principles

- **100% Functional Programming**: Pure functions, no classes
- **Type-Safe**: Full TypeScript with strict mode
- **Modular**: Easy to extend with new commands and AI providers
- **Streaming Support**: Real-time AI responses
- **VS Code Native**: Follows VS Code design patterns and theming

## Extending

### Add a New Command

1. Create handler in `src/handlers/`
2. Register in `src/commands/command-registry.ts`
3. Add to `package.json` contributes

### Add a New AI Provider

1. Create client in `src/ai/provider-client.ts`
2. Implement `generateCompletion` and `streamCompletion`
3. Update `extension.ts` to use new provider

### Add UI Components

1. Create component in `webview-src/components/`
2. Import in `chat-interface.tsx`
3. Style with CSS in `webview-src/styles/index.css`

## License

MIT
