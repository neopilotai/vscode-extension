"use client"

import { useEffect } from "react"
import { ChatInterface } from "./components/chat-interface"
import { useWebViewStore } from "./store/webview-store"
import { VSCodeAPI } from "./utils/vscode-api"

export function App() {
  const { setReady } = useWebViewStore()

  useEffect(() => {
    // Initialize VS Code API
    VSCodeAPI.initialize()
    setReady(true)

    // Signal to extension that WebView is ready
    VSCodeAPI.postMessage({ type: "ready" })
  }, [setReady])

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col">
      <ChatInterface />
    </div>
  )
}
