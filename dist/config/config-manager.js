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
exports.ConfigManager = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Manages extension configuration
 */
class ConfigManager {
    constructor() {
        this.config = vscode.workspace.getConfiguration("ai-assistant");
    }
    getAIConfig() {
        return {
            provider: this.config.get("provider") || "openai",
            model: this.config.get("model") || "gpt-4",
            apiKey: this.config.get("apiKey") || process.env.OPENAI_API_KEY,
            temperature: this.config.get("temperature") || 0.7,
            maxTokens: this.config.get("maxTokens") || 2000,
        };
    }
    setAIConfig(config) {
        if (config.provider) {
            this.config.update("provider", config.provider, vscode.ConfigurationTarget.Global);
        }
        if (config.model) {
            this.config.update("model", config.model, vscode.ConfigurationTarget.Global);
        }
        if (config.temperature !== undefined) {
            this.config.update("temperature", config.temperature, vscode.ConfigurationTarget.Global);
        }
        if (config.maxTokens !== undefined) {
            this.config.update("maxTokens", config.maxTokens, vscode.ConfigurationTarget.Global);
        }
    }
    getAutoSuggest() {
        return this.config.get("autoSuggest") || false;
    }
    setAutoSuggest(enabled) {
        this.config.update("autoSuggest", enabled, vscode.ConfigurationTarget.Global);
    }
    getLanguages() {
        return this.config.get("supportedLanguages") || ["typescript", "javascript", "python", "java", "cpp"];
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config-manager.js.map