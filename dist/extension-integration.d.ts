import * as vscode from "vscode";
/**
 * Main integration class that ties all components together
 */
export declare class ExtensionIntegration {
    private context;
    private extensionManager;
    private webviewManager;
    private aiService;
    private suggestionManager;
    private eventHandler;
    private commandRegistry;
    private configManager;
    constructor(context: vscode.ExtensionContext);
    activate(): void;
    private registerProviders;
    private setupEventListeners;
    private watchConfigurationChanges;
    deactivate(): void;
}
//# sourceMappingURL=extension-integration.d.ts.map