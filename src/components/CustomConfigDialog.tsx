import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICustomLLMConfig } from '@/types/llm';

interface CustomConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ICustomLLMConfig;
  onSave: (config: ICustomLLMConfig) => void;
  isAzure?: boolean;
}

const CustomConfigDialog: React.FC<CustomConfigDialogProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
  isAzure = false
}) => {
  const [editedConfig, setEditedConfig] = useState(config);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isAzure ? 'Azure Custom LLM Configuration' : 'Custom LLM Configuration'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="endpoint">
              {isAzure ? 'Azure Endpoint URL' : 'Endpoint URL'}
            </Label>
            <Input
              id="endpoint"
              value={editedConfig.endpoint}
              onChange={(e) => setEditedConfig(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder={isAzure ? "https://your-resource.openai.azure.com" : "https://api.example.com"}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiKey">
              {isAzure ? 'Azure API Key' : 'API Key'}
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={editedConfig.apiKey}
              onChange={(e) => setEditedConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder={isAzure ? "Enter Azure API Key" : "Enter API Key"}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="modelName">
              {isAzure ? 'Deployment Name' : 'Model Name'}
            </Label>
            <Input
              id="modelName"
              value={editedConfig.modelName}
              onChange={(e) => setEditedConfig(prev => ({ ...prev, modelName: e.target.value }))}
              placeholder={isAzure ? "Enter Deployment Name" : "Enter Model Name"}
            />
          </div>
          
          {isAzure && (
            <div className="grid gap-2">
              <Label htmlFor="apiVersion">API Version</Label>
              <Input
                id="apiVersion"
                value={editedConfig.apiVersion || ''}
                onChange={(e) => setEditedConfig(prev => ({ ...prev, apiVersion: e.target.value }))}
                placeholder="2023-07-01-preview"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            onSave(editedConfig);
            onOpenChange(false);
          }}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomConfigDialog;