import { create } from "zustand"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  metadata?: Record<string, any>
}

interface Suggestion {
  id: string
  type: string
  text: string
}

interface ChatStore {
  messages: ChatMessage[]
  suggestions: Suggestion[]
  isLoading: boolean
  addMessage: (msg: ChatMessage) => void
  setSuggestions: (suggestions: Suggestion[]) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  suggestions: [],
  isLoading: false,

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  setSuggestions: (suggestions) => set({ suggestions }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [], suggestions: [] }),
}))
