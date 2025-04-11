import React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CustomConfigDialog from './CustomConfigDialog';

interface AIControlsProps {
  useAI: boolean;
  onToggleAI: (enabled: boolean) => void;
  modelType: 'azure' | 'local' | 'custom';
  onModelChange: (type: 'azure' | 'local' | 'custom') => void;
  customConfig: {
    endpoint: string;
    apiKey: string;
    modelName: string;
    isConfigured?: boolean;  // Add isConfigured property
  };
  onCustomConfigChange: (config: { endpoint: string; apiKey: string; modelName: string, isConfigured: boolean }) => void;
}

const AIControls: React.FC<AIControlsProps> = ({
  useAI,
  onToggleAI,
  modelType,
  onModelChange,
  customConfig,
  onCustomConfigChange
}) => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

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
            onChange={(e) => onModelChange(e.target.value as 'azure' | 'local' | 'custom')}
            className="p-2 rounded border"
          >
            <option value="azure">Azure OpenAI</option>
            <option value="local">Local Model</option>
            <option value="custom">Custom Endpoint</option>
          </select>
          
          {modelType === 'custom' && (
            <div className="flex items-center gap-2">
              <Button 
                variant={customConfig.endpoint && customConfig.apiKey && customConfig.modelName ? "outline" : "default"}
                onClick={() => setConfigDialogOpen(true)}
                size="sm"
              >
                {customConfig.endpoint && customConfig.apiKey && customConfig.modelName ? "Edit Configuration" : "Configure Custom LLM"}
              </Button>
              {customConfig.endpoint && customConfig.apiKey && customConfig.modelName && (
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
    </div>
  );
};

export default AIControls;