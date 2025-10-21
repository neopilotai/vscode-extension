import type React from "react"
import { useChatStore } from "../store/chat-store"

export const SuggestionPanel: React.FC = () => {
  const { suggestions } = useChatStore()

  if (suggestions.length === 0) return null

  return (
    <div className="suggestion-panel">
      <h3>Suggestions</h3>
      <div className="suggestions-list">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="suggestion-item">
            <div className="suggestion-type">{suggestion.type}</div>
            <p>{suggestion.text}</p>
            <button className="apply-btn">Apply</button>
          </div>
        ))}
      </div>
    </div>
  )
}
