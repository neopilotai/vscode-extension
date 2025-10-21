"use client"

import { useRef, useEffect, useState } from "react"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { useWebViewStore } from "../store/webview-store"
import { useVsCodeMessaging } from "../hooks/useVsCodeMessaging"
import type { ExtensionToWebViewMessage } from "../../src/types/messages"

interface ChatPanelProps {
  selectedCode?: string
  selectedLanguage?: string
}

export function ChatPanel({ selectedCode, selectedLanguage }: ChatPanelProps) {
  const { messages, isLoading, addMessage, setLoading } = useWebViewStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [streamingMessage, setStreamingMessage] = useState("")
  const { addMessageHandler } = useVsCodeMessaging()

  // Handle streaming messages
  useEffect(() => {
    const unsubscribe = addMessageHandler((message: ExtensionToWebViewMessage) => {
      if (message.type === "streamChunk") {
        const chunk = message.payload
        setStreamingMessage((prev) => prev + chunk.chunk)
        if (chunk.isComplete) {
          // Add complete message to store
          addMessage({
            id: chunk.id,
            role: "assistant",
            content: streamingMessage,
            timestamp: Date.now(),
          })
          setStreamingMessage("")
          setLoading(false)
        }
      } else if (message.type === "chatResponse") {
        addMessage({
          id: message.payload.id,
          role: "assistant",
          content: message.payload.content,
          timestamp: message.payload.timestamp,
        })
        setLoading(false)
      } else if (message.type === "error") {
        console.error("Error:", message.payload)
        setLoading(false)
      }
    })

    return unsubscribe
  }, [addMessage, addMessageHandler, setLoading, streamingMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <h1 className="text-lg font-semibold text-card-foreground">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">Chat with your AI code assistant</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingMessage ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start a conversation or select code to analyze</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-xs lg:max-w-md">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{streamingMessage}</p>
                </div>
              </div>
            )}
            {isLoading && !streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-xs">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <ChatInput selectedCode={selectedCode} selectedLanguage={selectedLanguage} />
      </div>
    </div>
  )
}
