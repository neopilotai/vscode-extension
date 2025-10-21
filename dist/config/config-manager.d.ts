import type { AIModelConfig } from "../types/messages";
/**
 * Manages extension configuration
 */
export declare class ConfigManager {
    private config;
    constructor();
    getAIConfig(): AIModelConfig;
    setAIConfig(config: Partial<AIModelConfig>): void;
    getAutoSuggest(): boolean;
    setAutoSuggest(enabled: boolean): void;
    getLanguages(): string[];
}
//# sourceMappingURL=config-manager.d.ts.map