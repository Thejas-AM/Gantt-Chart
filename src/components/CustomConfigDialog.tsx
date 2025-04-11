import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: {
    endpoint: string;
    apiKey: string;
    modelName: string;
    isConfigured?: boolean;
  };
  onSave: (config: { endpoint: string; apiKey: string; modelName: string, isConfigured?: boolean; }) => void;
}

const CustomConfigDialog: React.FC<CustomConfigDialogProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
}) => {
  const [editedConfig, setEditedConfig] = useState(config);

  const handleSave = () => {
    onSave(editedConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Custom LLM Configuration</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="endpoint">Endpoint URL</Label>
            <Input
              id="endpoint"
              value={editedConfig.endpoint}
              onChange={(e) => setEditedConfig(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder="https://api.example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={editedConfig.apiKey}
              onChange={(e) => setEditedConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter API Key"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="modelName">Model Name</Label>
            <Input
              id="modelName"
              value={editedConfig.modelName}
              onChange={(e) => setEditedConfig(prev => ({ ...prev, modelName: e.target.value }))}
              placeholder="Enter Model Name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomConfigDialog;