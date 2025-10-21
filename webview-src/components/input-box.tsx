"use client"

import type React from "react"
import { useState } from "react"

interface InputBoxProps {
  onSend: (message: string) => void
  isLoading: boolean
  selectedText: string
}

export const InputBox: React.FC<InputBoxProps> = ({ onSend, isLoading, selectedText }) => {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput("")
    }
  }

  return (
    <form className="input-box" onSubmit={handleSubmit}>
      {selectedText && (
        <div className="selected-text-preview">
          <small>Selected: {selectedText.slice(0, 50)}...</small>
        </div>
      )}
      <div className="input-wrapper">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Assistant..."
          disabled={isLoading}
          className="input-field"
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
          {isLoading ? "⏳" : "➤"}
        </button>
      </div>
    </form>
  )
}
