import React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CustomConfigDialog from './CustomConfigDialog';
import { ICustomLLMConfig, ModelType } from '@/types/llm';

interface AIControlsProps {
  useAI: boolean;
  onToggleAI: (enabled: boolean) => void;
  modelType: ModelType;
  onModelChange: (type: ModelType) => void;
  customConfig: ICustomLLMConfig;
  onCustomConfigChange: (config: ICustomLLMConfig) => void;
  azureCustomConfig: ICustomLLMConfig;
  onAzureCustomConfigChange: (config: ICustomLLMConfig) => void;
}

const AIControls: React.FC<AIControlsProps> = ({
  useAI,
  onToggleAI,
  modelType,
  onModelChange,
  customConfig,
  onCustomConfigChange,
  azureCustomConfig,
  onAzureCustomConfigChange
}) => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [azureConfigDialogOpen, setAzureConfigDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Switch checked={useAI} onCheckedChange={onToggleAI} id="ai-mode" />
        <Label htmlFor="ai-mode">AI Assistant</Label>
      </div>
      {useAI && (
        <div className="flex flex-col gap-2">
          <select
            value={modelType}
            onChange={(e) => onModelChange(e.target.value as ModelType)}
            className="p-2 rounded border"
          >
            <option value="azure">Azure OpenAI</option>
            <option value="local">Local Model</option>
            <option value="custom">Custom Endpoint</option>
            <option value="azure-custom">Azure Custom</option>
          </select>
          
          {modelType === 'custom' && (
            <div className="flex items-center gap-2">
              <Button 
                variant={customConfig.isConfigured ? "outline" : "default"}
                onClick={() => setConfigDialogOpen(true)}
                size="sm"
              >
                {customConfig.isConfigured ? "Edit Configuration" : "Configure Custom LLM"}
              </Button>
              {customConfig.isConfigured && (
                <span className="text-sm text-green-600">✓ Configured</span>
              )}
            </div>
          )}

          {modelType === 'azure-custom' && (
            <div className="flex items-center gap-2">
              <Button 
                variant={azureCustomConfig.isConfigured ? "outline" : "default"}
                onClick={() => setAzureConfigDialogOpen(true)}
                size="sm"
              >
                {azureCustomConfig.isConfigured ? "Edit Azure Configuration" : "Configure Azure Custom"}
              </Button>
              {azureCustomConfig.isConfigured && (
                <span className="text-sm text-green-600">✓ Configured</span>
              )}
            </div>
          )}
        </div>
      )}

      <CustomConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        config={customConfig}
        onSave={(config) => {
          onCustomConfigChange({
            ...config,
            isConfigured: Boolean(config.endpoint && config.apiKey && config.modelName)
          });
        }}
      />

      <CustomConfigDialog
        open={azureConfigDialogOpen}
        onOpenChange={setAzureConfigDialogOpen}
        config={azureCustomConfig}
        onSave={(config) => {
          onAzureCustomConfigChange({
            ...config,
            isConfigured: Boolean(config.endpoint && config.apiKey && config.modelName),
            apiVersion: config.apiVersion
          });
        }}
        isAzure={true}
      />
    </div>
  );
};

export default AIControls;