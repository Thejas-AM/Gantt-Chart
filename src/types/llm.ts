export enum ModelType {
    Azure = 'azure',
    Local = 'local',
    Custom = 'custom',
    AzureCustom = 'azure-custom'
}

export interface ICustomLLMConfig {
    endpoint: string;
    apiKey: string;
    modelName: string;
    isConfigured: boolean;
    apiVersion?: string;
}