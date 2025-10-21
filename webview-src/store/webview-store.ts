import { create } from "zustand"
import type { ChatMessage } from "../../src/types/messages"

interface WebViewState {
  messages: ChatMessage[]
  isLoading: boolean
  isReady: boolean
  addMessage: (message: ChatMessage) => void
  setLoading: (loading: boolean) => void
  setReady: (ready: boolean) => void
  clearMessages: () => void
}

export const useWebViewStore = create<WebViewState>((set) => ({
  messages: [],
  isLoading: false,
  isReady: false,

  addMessage: (message: ChatMessage) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setLoading: (loading: boolean) =>
    set(() => ({
      isLoading: loading,
    })),

  setReady: (ready: boolean) =>
    set(() => ({
      isReady: ready,
    })),

  clearMessages: () =>
    set(() => ({
      messages: [],
    })),
}))
