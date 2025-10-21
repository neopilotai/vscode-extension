import type { WebViewToExtensionMessage, ExtensionToWebViewMessage } from "../types/messages";
export type Message = WebViewToExtensionMessage | ExtensionToWebViewMessage;
export declare const createMessage: <T extends Message>(type: T["type"], payload: Omit<T, "type" | "id" | "timestamp">) => T;
export declare const generateId: () => string;
export declare const isValidMessage: (msg: unknown) => msg is Message;
export declare const parseMessage: (data: unknown) => Message | null;
export declare const serializeMessage: (msg: Message) => string;
//# sourceMappingURL=message-handler.d.ts.map