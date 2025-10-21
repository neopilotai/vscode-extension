import type { WebViewToExtensionMessage, ExtensionToWebViewMessage } from "../types/messages"

// Union type for all messages
export type Message = WebViewToExtensionMessage | ExtensionToWebViewMessage

export const createMessage = <T extends Message>(type: T["type"], payload: Omit<T, "type" | "id" | "timestamp">): T =>
  ({
    type,
    id: generateId(),
    timestamp: Date.now(),
    ...payload,
  } as unknown as T)

export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const isValidMessage = (msg: unknown): msg is Message => {
  if (typeof msg !== "object" || msg === null) return false
  const m = msg as Record<string, unknown>
  return typeof m.type === "string" && typeof m.id === "string" && typeof m.timestamp === "number"
}

export const parseMessage = (data: unknown): Message | null => {
  try {
    const msg = typeof data === "string" ? JSON.parse(data) : data
    return isValidMessage(msg) ? msg : null
  } catch {
    return null
  }
}

export const serializeMessage = (msg: Message): string => JSON.stringify(msg)
