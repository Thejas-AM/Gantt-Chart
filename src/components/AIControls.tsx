import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AIControlsProps {
  useAI: boolean;
  onToggleAI: (enabled: boolean) => void;
  modelType: 'azure' | 'local';
  onModelChange: (type: 'azure' | 'local') => void;
}

const AIControls: React.FC<AIControlsProps> = ({
  useAI,
  onToggleAI,
  modelType,
  onModelChange
}) => {
  return (
    <div className="flex flex-col items-center justify-start min-h-[80px] gap-2">
      <div className="flex items-center gap-2 min-w-[150px]">
        <Label htmlFor="ai-mode">AI Mode</Label>
        <Switch
          id="ai-mode"
          checked={useAI}
          onCheckedChange={onToggleAI}
        />
      </div>
      <div className={`transition-all duration-200 ${useAI ? 'opacity-100 max-h-[40px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <div className="flex items-center gap-2">
          <Label htmlFor="model-select">Model</Label>
          <select
            id="model-select"
            value={modelType}
            onChange={(e) => onModelChange(e.target.value as 'azure' | 'local')}
            className="rounded-md border border-gray-300 px-2 py-1"
          >
            <option value="azure">Azure OpenAI</option>
            <option value="local">Local LLM</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AIControls);