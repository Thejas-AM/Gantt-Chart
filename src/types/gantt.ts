
export interface GanttTask {
  id: string;
  name: string;
  start: number; // Timestamp
  end: number; // Timestamp
  progress: number; // 0-100
  dependencies?: string[];
  milestone?: boolean;
  parent?: string;
  assignee?: string;
  color?: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'delayed';
}

export interface GanttCategory {
  id: string;
  name: string;
}

export interface GanttData {
  tasks: GanttTask[];
  categories: GanttCategory[];
}

export interface GanttProject {
  id: string;
  name: string;
  description: string;
  startDate: number; // Timestamp
  resources?: string[];
  data: GanttData;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'system';
  timestamp: number;
  isProcessing?: boolean;
}
