
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, GanttTask } from '@/types/gantt';
import { formatDateTime } from '@/utils/dateUtils';
import { Send, Loader2 } from 'lucide-react';
import { useChatSuggestions } from '@/hooks/useChatSuggestions';
import AIControls from '@/components/AIControls';
import { ICustomLLMConfig, ModelType } from '@/types/llm';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  tasks: GanttTask[];
  useAI?: boolean;
  onToggleAI: (enabled: boolean) => void;
  modelType: ModelType;
  onModelChange: (type: ModelType) => void;
  customConfig?: ICustomLLMConfig;
  onCustomConfigChange?: (config: ICustomLLMConfig) => void;
  azureCustomConfig?: ICustomLLMConfig;
  onAzureCustomConfigChange?: (config: ICustomLLMConfig) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  tasks,
  useAI = false,
  onToggleAI,
  modelType,
  onModelChange,
  customConfig = { endpoint: '', apiKey: '', modelName: '', isConfigured: false },
  onCustomConfigChange,
  azureCustomConfig = { endpoint: '', apiKey: '', modelName: '', apiVersion: '', isConfigured: false },
  onAzureCustomConfigChange
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = useChatSuggestions(inputValue, tasks);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setSelectedSuggestion(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedSuggestion]);
      } else if (e.key === 'Escape') {
        setSelectedSuggestion(-1);
      }
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center gap-2">
          <div className='flex flex-col gap-2'>
            <h2 className="text-lg font-medium">Chat with Gantt</h2>
            <p className="text-sm text-gray-500">
              Use natural language to update your project timeline
            </p>
          </div>
          <AIControls
            useAI={useAI}
            onToggleAI={onToggleAI}
            modelType={modelType}
            onModelChange={onModelChange}
            customConfig={customConfig}
            onCustomConfigChange={onCustomConfigChange}
            azureCustomConfig={azureCustomConfig}
            onAzureCustomConfigChange={onAzureCustomConfigChange}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                  }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className="text-xs mt-1 opacity-70">
                  {formatDateTime(new Date(message.timestamp))}
                </div>
                {message.isProcessing && (
                  <div className="flex items-center mt-1">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    <span className="text-xs opacity-70">Processing...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="relative flex flex-col">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message to update the Gantt chart..."
              className="flex-1"
            />
            <Button type="submit" disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${index === selectedSuggestion ? 'bg-gray-100' : ''
                    }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default React.memo(ChatInterface);
