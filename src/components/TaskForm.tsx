
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GanttTask } from '@/types/gantt';
import { Progress } from "@/components/ui/progress";
import { Check, CirclePlus, CircleMinus, Calendar } from 'lucide-react';
import { addDays, dateToTimestamp, getCurrentMonday, timestampToDate } from '@/utils/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from './ui/use-toast';

interface TaskFormProps {
  onTaskCreate: (task: GanttTask) => void;
  onTaskUpdate: (task: GanttTask) => void;
  onClose: () => void;
  open: boolean;
  tasks?: GanttTask[];
  isFeatureRequired?: boolean;
  editingTask?: GanttTask | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  onTaskCreate, 
  onTaskUpdate,
  onClose, 
  open, 
  tasks = [], 
  isFeatureRequired = true,
  editingTask = null
}) => {
  const defaultStartDate = getCurrentMonday();

  // Initialize state with editingTask values if present
  const [taskName, setTaskName] = useState(editingTask?.name || '');
  const [startDate, setStartDate] = useState<Date>(editingTask ? timestampToDate(editingTask.start) : defaultStartDate);
  const [duration, setDuration] = useState(editingTask ? 
    Math.ceil((editingTask.end - editingTask.start) / (24 * 60 * 60 * 1000)) : 5);
  const [progress, setProgress] = useState(editingTask?.progress || 0);
  const [dependency, setDependency] = useState(editingTask?.dependencies?.[0] || 'none');
  const [color, setColor] = useState(editingTask?.color || '#6366F1');
  const [feature, setFeature] = useState(editingTask?.feature || 'none');
  const [customFeature, setCustomFeature] = useState('');
  const [isCustomFeature, setIsCustomFeature] = useState(false);
  const {toast} = useToast();

  // Add handleProgressIncrement function
  const handleProgressIncrement = (amount: number) => {
    const newProgress = Math.min(100, Math.max(0, progress + amount));
    setProgress(newProgress);
  };

  // Update form title and button text based on mode
  const isEditMode = Boolean(editingTask);
  const formTitle = isEditMode ? 'Edit Task' : 'Create New Task';
  const buttonText = isEditMode ? 'Update Task' : 'Create Task';

  // Update useEffect to handle editingTask changes
  useEffect(() => {
    if (editingTask) {
      setTaskName(editingTask.name);
      setStartDate(timestampToDate(editingTask.start));
      setDuration(Math.ceil((editingTask.end - editingTask.start) / (24 * 60 * 60 * 1000)));
      setProgress(editingTask.progress);
      setDependency(editingTask.dependencies?.[0] || 'none');
      setColor(editingTask.color || '#6366F1');
      setFeature(editingTask.feature || 'none');
      setIsCustomFeature(false);
      setCustomFeature('');
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) return;

    if (isFeatureRequired && feature === 'none' && !isCustomFeature) {
      toast({
        title: "Feature Required",
        description: "Please select or create a Feature task",
        variant: "destructive",
      });
      return;
    }

    const taskData: GanttTask = {
      id: editingTask?.id || `task${Date.now()}`,
      name: taskName,
      start: dateToTimestamp(startDate),
      end: dateToTimestamp(addDays(startDate, duration)),
      progress: progress,
      color: color,
      status: progress === 0 ? 'not-started' : progress === 100 ? 'completed' : 'in-progress',
      dependencies: dependency !== 'none' ? [dependency] : [],
      feature: isCustomFeature ? customFeature : feature,
      milestone: editingTask?.milestone || false
    };

    if (isEditMode) {
      onTaskUpdate(taskData);
    } else {
      onTaskCreate(taskData);
    }

    // Reset form
    setTaskName('');
    setStartDate(defaultStartDate);
    setDuration(5);
    setProgress(0);
    setDependency('none');
    setColor('#6366F1');
    setFeature('none');
    setCustomFeature('');
    setIsCustomFeature(false);

    onClose();
  };

  // Update DialogTitle and Button text
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the task details.' : 'Fill in the details to add a new task to your project.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              placeholder="Enter task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                    id="startDate"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-gray-500">Days</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependency">Dependency</Label>
            <Select
              value={dependency}
              onValueChange={setDependency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a task dependency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem> {/* Changed from '' to 'none' */}
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feature">Feature Task {isFeatureRequired && '*'}</Label>
            <Select
              value={feature}
              onValueChange={(value) => {
                setFeature(value);
                setIsCustomFeature(value === 'custom');
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select or create feature task (required)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="custom">Create New Feature</SelectItem>
                {Array.from(new Set(tasks.map(task => task.feature)))
                  .filter(feature => feature && feature !== 'none') // Filter out null/undefined/none
                  .map((parentName) => (
                    <SelectItem key={parentName} value={parentName}>
                      {parentName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {isCustomFeature && (
              <div className="mt-2">
                <Input
                  placeholder="Enter new feature task name"
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  required={isCustomFeature}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Progress</Label>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleProgressIncrement(-5)}
                disabled={progress <= 0}
              >
                <CircleMinus className="h-4 w-4" />
              </Button>
              <div className="space-x-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProgress(0)}
                >
                  0%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProgress(50)}
                >
                  50%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProgress(100)}
                >
                  100%
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleProgressIncrement(5)}
                disabled={progress >= 100}
              >
                <CirclePlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Task Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <span className="text-sm text-gray-500">{color}</span>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="submit">
              <Check className="h-4 w-4 mr-2" /> {buttonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
