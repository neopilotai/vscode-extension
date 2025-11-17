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
exports.ExtensionIntegration = void 0;
const vscode = __importStar(require("vscode"));
const extension_manager_1 = require("./extension-manager");
const webview_manager_1 = require("./webview-manager");
const ai_service_1 = require("./ai/ai-service");
const suggestion_manager_1 = require("./suggestion-manager");
const event_handler_1 = require("./event-handler");
const command_registry_1 = require("./command-registry");
const config_manager_1 = require("./config/config-manager");
const code_lens_provider_1 = require("./providers/code-lens-provider");
const hover_provider_1 = require("./providers/hover-provider");
const completion_provider_1 = require("./providers/completion-provider");
/**
 * Main integration class that ties all components together
 */
class ExtensionIntegration {
    constructor(context) {
        this.context = context;
        this.configManager = new config_manager_1.ConfigManager();
        this.extensionManager = new extension_manager_1.ExtensionManager(context);
        this.webviewManager = new webview_manager_1.WebViewManager();
        this.aiService = new ai_service_1.AIService(this.configManager.getAIConfig());
        this.suggestionManager = new suggestion_manager_1.SuggestionManager(this.aiService);
        this.eventHandler = new event_handler_1.EventHandler(this.aiService, this.suggestionManager, this.extensionManager);
        this.commandRegistry = new command_registry_1.CommandRegistry(this.aiService, this.suggestionManager, this.webviewManager, this.extensionManager);
    }
    activate() {
        console.log("Activating AI Assistant extension...");
        // Register commands
        this.commandRegistry.registerCommands(this.context);
        // Register providers
        this.registerProviders();
        // Setup event listeners
        this.setupEventListeners();
        // Watch for configuration changes
        this.watchConfigurationChanges();
        console.log("AI Assistant extension activated successfully");
    }
    registerProviders() {
        // Code Lens Provider
        const codeLensProvider = new code_lens_provider_1.AICodeLensProvider(this.aiService);
        this.context.subscriptions.push(vscode.languages.registerCodeLensProvider("file", codeLensProvider));
        // Hover Provider
        const hoverProvider = new hover_provider_1.AIHoverProvider(this.aiService);
        this.context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: "file" }, hoverProvider));
        // Completion Provider
        const completionProvider = new completion_provider_1.AICompletionProvider(this.aiService);
        this.context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ scheme: "file" }, completionProvider));
    }
    setupEventListeners() {
        // Editor change
        this.context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                this.eventHandler.onEditorChange(editor);
            }
        }));
        // Selection change
        this.context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection((event) => {
            this.eventHandler.onSelectionChange(event);
        }));
        // Text change
        this.context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
            this.eventHandler.onTextChange(event);
        }));
    }
    watchConfigurationChanges() {
        this.context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("ai-assistant")) {
                const newConfig = this.configManager.getAIConfig();
                this.aiService.updateConfig(newConfig);
                vscode.window.showInformationMessage("AI Assistant configuration updated");
            }
        }));
    }
    deactivate() {
        console.log("Deactivating AI Assistant extension...");
        this.eventHandler.dispose();
        this.suggestionManager.dispose();
    }
}
exports.ExtensionIntegration = ExtensionIntegration;
//# sourceMappingURL=extension-integration.js.map