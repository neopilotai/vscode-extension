"use client"

import { useRef, useState, useCallback } from "react"
import Editor from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { Copy, Zap } from "lucide-react"

interface EditorProps {
  onCodeSelect?: (code: string, language: string) => void
  onQuickAction?: (action: "explain" | "refactor" | "tests", code: string) => void
}

export function EditorPanel({ onCodeSelect, onQuickAction }: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const [language, setLanguage] = useState("typescript")
  const [code, setCode] = useState(`// Welcome to AI Code Assistant
// Select code and use quick actions below

function fibonacci(n: number): number {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}`)

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
    }
  }

  const getSelectedCode = useCallback(() => {
    if (!editorRef.current) return ""
    const selection = editorRef.current.getSelection()
    if (!selection) return ""
    const model = editorRef.current.getModel()
    if (!model) return ""
    return model.getValueInRange(selection)
  }, [])

  const handleSelectCode = () => {
    const selected = getSelectedCode()
    if (selected) {
      onCodeSelect?.(selected, language)
    }
  }

  const handleQuickAction = (action: "explain" | "refactor" | "tests") => {
    const selected = getSelectedCode() || code
    onQuickAction?.(action, selected)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="flex flex-col h-full bg-editor">
      {/* Header */}
      <div className="border-b border-border bg-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-card-foreground">Code Editor</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs bg-muted text-muted-foreground border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <button onClick={handleCopyCode} className="p-1 hover:bg-muted rounded transition-colors" title="Copy code">
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="border-t border-border bg-card p-3 flex gap-2">
        <button
          onClick={handleSelectCode}
          className="flex-1 px-3 py-2 text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 rounded transition-colors"
        >
          Send Selected
        </button>
        <button
          onClick={() => handleQuickAction("explain")}
          className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Zap className="w-3 h-3" />
          Explain
        </button>
        <button
          onClick={() => handleQuickAction("refactor")}
          className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Zap className="w-3 h-3" />
          Refactor
        </button>
        <button
          onClick={() => handleQuickAction("tests")}
          className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Zap className="w-3 h-3" />
          Tests
        </button>
      </div>
    </div>
  )
}
