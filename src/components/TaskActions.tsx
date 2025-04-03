
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GanttTask } from '@/types/gantt';
import { Progress } from "@/components/ui/progress";
import { Edit, Plus, Check, Circle, CirclePlus, CircleMinus,DeleteIcon, Delete, Trash } from 'lucide-react';
import { formatDateTime, timestampToDate } from '@/utils/dateUtils';
import TaskForm from './TaskForm';

interface TaskActionsProps {
  tasks: GanttTask[];
  onTaskUpdate: (task: GanttTask) => void;
  onTaskCreate: (task: GanttTask) => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({ tasks, onTaskUpdate, onTaskCreate }) => {
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedProgress, setEditedProgress] = useState(0);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const handleEditTask = (task: GanttTask) => {
    setSelectedTask(task);
    setEditedName(task.name);
    setEditedProgress(task.progress);
  };

  const handleSaveChanges = () => {
    if (selectedTask) {
      onTaskUpdate({
        ...selectedTask,
        name: editedName,
        progress: editedProgress,
        status: editedProgress === 0 ? 'not-started' : 
                editedProgress === 100 ? 'completed' : 'in-progress',
      });
      setSelectedTask(null);
    }
  };

  const handleProgressIncrement = (amount: number) => {
    const newProgress = Math.min(100, Math.max(0, editedProgress + amount));
    setEditedProgress(newProgress);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tasks</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setIsAddTaskOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Task Form Dialog */}
      <TaskForm 
        onTaskCreate={onTaskCreate}
        onClose={() => setIsAddTaskOpen(false)}
        open={isAddTaskOpen}
        tasks={tasks}
      />

      <div className="space-y-2">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className="p-3 bg-white border rounded-md shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h4 className="font-medium">{task.name}</h4>
                <div className="text-sm text-gray-500 flex gap-2">
                  <span>{formatDateTime(timestampToDate(task.start))}</span>
                  <span>→</span>
                  <span>{formatDateTime(timestampToDate(task.end))}</span>
                </div>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditTask(task)}
                    className="ml-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {/* <Button 
                    variant="ghost" 
                    size="sm"
                    // onClick={() => handleDeleteTask(task)}
                    className="ml-2"
                  >
                    <Trash className="h-4 w-4" />
                  </Button> */}
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit Task</SheetTitle>
                    <SheetDescription>
                      Make changes to your task here.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Task Name
                      </label>
                      <Input
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Progress</label>
                        <span className="text-sm text-gray-500">{editedProgress}%</span>
                      </div>
                      <Progress value={editedProgress} className="h-2" />
                      <div className="flex items-center justify-between mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleProgressIncrement(-5)}
                          disabled={editedProgress <= 0}
                        >
                          <CircleMinus className="h-4 w-4" />
                        </Button>
                        <div className="space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditedProgress(0)}
                          >
                            0%
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditedProgress(25)}
                          >
                            25%
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditedProgress(50)}
                          >
                            50%
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditedProgress(75)}
                          >
                            75%
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditedProgress(100)}
                          >
                            100%
                          </Button>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleProgressIncrement(5)}
                          disabled={editedProgress >= 100}
                        >
                          <CirclePlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleSaveChanges}>
                      <Check className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="mt-2">
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
