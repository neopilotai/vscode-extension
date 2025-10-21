import type React from "react"

interface MessageListProps {
  messages: Array<{ role: string; content: string }>
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message message-${msg.role}`}>
          <div className="message-avatar">{msg.role === "user" ? "👤" : "🤖"}</div>
          <div className="message-content">
            <p>{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
