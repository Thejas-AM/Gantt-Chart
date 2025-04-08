import { useState, useEffect } from 'react';
import { GanttTask } from '@/types/gantt';
import { getChatSuggestions } from '@/utils/chatProcessor';

export const useChatSuggestions = (input: string, tasks: GanttTask[]) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (input.length > 2) {
      const newSuggestions = getChatSuggestions(input, tasks);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [input, tasks]);

  return suggestions;
};