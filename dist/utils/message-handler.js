"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeMessage = exports.parseMessage = exports.isValidMessage = exports.generateId = exports.createMessage = void 0;
const createMessage = (type, payload) => ({
    type,
    id: (0, exports.generateId)(),
    timestamp: Date.now(),
    ...payload,
});
exports.createMessage = createMessage;
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
exports.generateId = generateId;
const isValidMessage = (msg) => {
    if (typeof msg !== "object" || msg === null)
        return false;
    const m = msg;
    return typeof m.type === "string" && typeof m.id === "string" && typeof m.timestamp === "number";
};
exports.isValidMessage = isValidMessage;
const parseMessage = (data) => {
    try {
        const msg = typeof data === "string" ? JSON.parse(data) : data;
        return (0, exports.isValidMessage)(msg) ? msg : null;
    }
    catch {
        return null;
    }
};
exports.parseMessage = parseMessage;
const serializeMessage = (msg) => JSON.stringify(msg);
exports.serializeMessage = serializeMessage;
//# sourceMappingURL=message-handler.js.map