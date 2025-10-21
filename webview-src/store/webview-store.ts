import { create } from "zustand"
import type { ChatMessage } from "../../src/types/messages"

interface WebViewState {
  messages: ChatMessage[]
  isLoading: boolean
  isReady: boolean
  streamingMessageId: string | null
  addMessage: (message: ChatMessage) => void
  setLoading: (loading: boolean) => void
  setReady: (ready: boolean) => void
  clearMessages: () => void
  updateStreamingMessage: (messageId: string, chunk: string) => void
  completeStreamingMessage: (messageId: string) => void
}

export const useWebViewStore = create<WebViewState>((set, get) => ({
  messages: [],
  isLoading: false,
  isReady: false,
  streamingMessageId: null,

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

  updateStreamingMessage: (messageId: string, chunk: string) =>
    set((state) => {
      const messageIndex = state.messages.findIndex(msg => msg.id === messageId)
      if (messageIndex >= 0) {
        const updatedMessages = [...state.messages]
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: updatedMessages[messageIndex].content + chunk,
        }
        return {
          messages: updatedMessages,
          streamingMessageId: messageId,
        }
      }
      return {
        streamingMessageId: messageId,
      }
    }),

  completeStreamingMessage: (messageId: string) =>
    set((state) => ({
      streamingMessageId: null,
      isLoading: false,
    })),
}))
