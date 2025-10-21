import type { ChatMessage as ChatMessageType } from "../../src/types/messages"

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-lg p-3 max-w-xs lg:max-w-md ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        {message.codeContext && (
          <div className="mt-2 pt-2 border-t border-current opacity-50">
            <p className="text-xs font-mono">{message.codeContext.fileName}</p>
          </div>
        )}
      </div>
    </div>
  )
}
