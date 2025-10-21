import * as vscode from "vscode";
interface CommandHandlers {
    openChat: () => void;
    getCompletion: () => void;
    explainCode: () => void;
    generateTests: () => void;
}
export declare const registerCommands: (context: vscode.ExtensionContext, handlers: CommandHandlers) => void;
export {};
//# sourceMappingURL=command-registry.d.ts.map