
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GanttTask } from '@/types/gantt';
import { Progress } from "@/components/ui/progress";
import { Edit, Plus, Check, Circle, CirclePlus, CircleMinus, DeleteIcon, Delete, Trash } from 'lucide-react';
import { formatDateTime, timestampToDate } from '@/utils/dateUtils';
import TaskForm from './TaskForm';
import { Switch } from '@radix-ui/react-switch';

interface TaskActionsProps {
  tasks: GanttTask[];
  onTaskUpdate: (task: GanttTask) => void;
  onTaskCreate: (task: GanttTask) => void;
  onTaskDelete: (taskId: string) => void;  // Add this line
}

const TaskActions: React.FC<TaskActionsProps> = ({
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete  // Add this line
}) => {
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [editedTask, setEditedTask] = useState<Partial<GanttTask>>({});

  // Update state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);

  const handleEditTask = (task: GanttTask) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  // In the return statement, replace both Sheet and TaskForm with:
  {/* Task Form Dialog for both Create and Edit */ }


  {/* Update the Add Task button onClick */ }


  {/* Update the Edit button */ }

  const handleSaveChanges = () => {
    if (selectedTask && editedTask) {
      onTaskUpdate({
        ...selectedTask,
        ...editedTask,
        status: editedTask.progress === 0 ? 'not-started' :
          editedTask.progress === 100 ? 'completed' : 'in-progress',
      });
      setSelectedTask(null);
      setEditedTask({});
    }
  };

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const handleDeleteTask = (taskId: string) => {
    onTaskDelete(taskId);
  };

  // In the task mapping section, add delete button next to edit:
  return (
    <div className="space-y-4 h-full overflow-hidden">
      {/* Fixed header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tasks</h3>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => {
            setEditingTask(null);
            setIsTaskFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Task Form Dialog */}
      <TaskForm
        onTaskCreate={onTaskCreate}
        onTaskUpdate={onTaskUpdate}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        open={isTaskFormOpen}
        tasks={tasks}
        isFeatureRequired={false}
        editingTask={editingTask}
      />

      {/* Scrollable task list with fixed height */}
      <div className="space-y-2 overflow-y-auto h-[calc(100vh-490px)] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3 bg-white border rounded-md shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center gap-4">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium truncate" title={task.name}>
                  {task.name}
                </h4>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditTask(task)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-sm text-gray-500 flex gap-2">
                <span>{formatDateTime(timestampToDate(task.start))}</span>
                <span>→</span>
                <span>{formatDateTime(timestampToDate(task.end))}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-medium">{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskActions;
