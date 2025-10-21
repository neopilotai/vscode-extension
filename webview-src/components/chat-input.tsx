"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useWebViewStore } from "../store/webview-store"
import { VSCodeAPI } from "../utils/vscode-api"
import { Send, Paperclip } from "lucide-react"

export function ChatInput() {
  const [input, setInput] = useState("")
  const [codeContext, setCodeContext] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addMessage, setLoading } = useWebViewStore()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
      timestamp: Date.now(),
      codeContext: codeContext ? { selectedText: codeContext, fileName: "", language: "", lineNumber: 0 } : undefined,
    }

    addMessage(userMessage)
    setLoading(true)

    // Send to extension
    VSCodeAPI.postMessage({
      type: "chat",
      payload: userMessage,
    })

    setInput("")
    setCodeContext(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAttachCode = () => {
    VSCodeAPI.postMessage({
      type: "getCompletion",
      payload: {
        position: { line: 0, character: 0 },
        language: "typescript",
        context: "",
      },
    })
  }

  return (
    <div className="space-y-2">
      {codeContext && (
        <div className="bg-muted p-2 rounded text-xs text-muted-foreground flex justify-between items-center">
          <span>Code context attached</span>
          <button onClick={() => setCodeContext(null)} className="text-destructive hover:text-destructive/80">
            ✕
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything... (Shift+Enter for new line)"
          className="flex-1 bg-input text-foreground border border-border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          rows={1}
        />
        <button
          onClick={handleAttachCode}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Attach code context"
        >
          <Paperclip className="w-5 h-5 text-muted-foreground" />
        </button>
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Send message (Enter)"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
