"use client"

import { useEffect, useState } from "react"
import { ChatPanel } from "./Chat"
import { EditorPanel } from "./Editor"
import { useWebViewStore } from "../store/webview-store"
import { useVsCodeMessaging } from "../hooks/useVsCodeMessaging"

export function App() {
  const { setReady } = useWebViewStore()
  const { postMessage } = useVsCodeMessaging()
  const [selectedCode, setSelectedCode] = useState<string>()
  const [selectedLanguage, setSelectedLanguage] = useState<string>()

  useEffect(() => {
    setReady(true)
    postMessage({ type: "ready" })
  }, [setReady, postMessage])

  const handleCodeSelect = (code: string, language: string) => {
    setSelectedCode(code)
    setSelectedLanguage(language)
  }

  const handleQuickAction = (action: "explain" | "refactor" | "tests", code: string) => {
    const messageType = action === "explain" ? "explainCode" : action === "refactor" ? "getCompletion" : "generateTests"

    postMessage({
      type: messageType as any,
      payload: {
        selectedText: code,
        fileName: "editor.ts",
        language: selectedLanguage || "typescript",
        lineNumber: 0,
      },
    })
  }

  return (
    <div className="h-screen w-full bg-background text-foreground flex">
      {/* Chat Panel - Left Side */}
      <div className="flex-1 flex flex-col border-r border-border">
        <ChatPanel selectedCode={selectedCode} selectedLanguage={selectedLanguage} />
      </div>

      {/* Editor Panel - Right Side */}
      <div className="flex-1 flex flex-col">
        <EditorPanel onCodeSelect={handleCodeSelect} onQuickAction={handleQuickAction} />
      </div>
    </div>
  )
}
