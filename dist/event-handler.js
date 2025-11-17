"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandler = void 0;
const vscode = __importStar(require("vscode"));
const config_manager_1 = require("./config/config-manager");
/**
 * Handles editor events and triggers AI operations
 */
class EventHandler {
    constructor(_aiService, suggestionManager, extensionManager) {
        this._aiService = _aiService;
        this.suggestionManager = suggestionManager;
        this.extensionManager = extensionManager;
        this.debounceTimer = null;
        this.debounceDelay = 1000; // 1 second
        this.configManager = new config_manager_1.ConfigManager();
    }
    onEditorChange(editor) {
        this.extensionManager.updateActiveEditor(editor);
        if (this.configManager.getAutoSuggest()) {
            this.debounceAutoSuggest(editor);
        }
    }
    onSelectionChange(event) {
        this.extensionManager.handleSelectionChange(event);
    }
    onTextChange(event) {
        this.extensionManager.handleTextChange(event);
        if (this.configManager.getAutoSuggest()) {
            this.debounceAutoSuggest(vscode.window.activeTextEditor);
        }
    }
    debounceAutoSuggest(editor) {
        if (!editor)
            return;
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        // Set new timer
        this.debounceTimer = setTimeout(() => {
            this.triggerAutoSuggest(editor);
        }, this.debounceDelay);
    }
    async triggerAutoSuggest(editor) {
        if (editor.selection.isEmpty)
            return;
        const selectedText = editor.document.getText(editor.selection);
        if (selectedText.length < 10)
            return; // Minimum length for suggestions
        try {
            await this.suggestionManager.generateSuggestions(editor);
        }
        catch (error) {
            console.error("Error generating auto suggestions:", error);
        }
    }
    dispose() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}
exports.EventHandler = EventHandler;
//# sourceMappingURL=event-handler.js.map