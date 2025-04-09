import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import GanttChart from '@/components/GanttChart';
import ChatInterface from '@/components/ChatInterface';
import TaskActions from '@/components/TaskActions';
import { useBlocker } from 'react-router-dom';
import { GanttData, GanttTask, ChatMessage, GanttProject } from '@/types/gantt';
import { processChatCommand } from '@/utils/chatProcessor';
import { Calendar, MessageSquare, BarChart2, ArrowLeft } from 'lucide-react';
import { initialGanttData } from '@/data/initialData';
import { processWithAzureLLM, processWithLocalLLM } from '@/services/azureLLM';

const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // This would typically come from an API or state management
  // For this example, we're using a mockup
  const [project, setProject] = useState<GanttProject | null>(null);
  const [ganttData, setGanttData] = useState<GanttData>(initialGanttData);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Welcome to your project! You can update tasks by chatting. For example, try 'Add a task Testing from day 18 to day 22'",
      sender: 'system',
      timestamp: Date.now()
    }
  ]);

  // Add save button state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Update the useEffect
  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }
  
    try {
      const savedProjects = localStorage.getItem('gantt-projects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const currentProject = projects.find((p: GanttProject) => p.id === projectId);
        
        if (currentProject) {
          setProject(currentProject);
          setGanttData(currentProject.data);
          return;
        }
      }
      
      // If project not found, redirect to home
      toast({
        title: "Project Not Found",
        description: "Redirecting to home page",
        variant: "destructive",
      });
      navigate('/');
      
    } catch (error) {
      console.error("Error loading project:", error);
      navigate('/');
    }
  }, [projectId, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        // Modern browsers will show a confirmation dialog without needing returnValue
        return 'Changes you made may not be saved.';
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
  
  // Add save function
  const handleSaveProject = () => {
    if (!project) return;
  
    try {
      const savedProjects = localStorage.getItem('gantt-projects');
      const projects = savedProjects ? JSON.parse(savedProjects) : [];
      const updatedProjects = projects.map((p: GanttProject) => 
        p.id === project.id ? {...project, data: ganttData} : p
      );
      localStorage.setItem('gantt-projects', JSON.stringify(updatedProjects));
      
      setHasUnsavedChanges(false);
      toast({
        title: "Project Saved",
        description: "All changes have been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save project changes.",
        variant: "destructive",
      });
    }
  };
  
  // Update task handlers to set unsaved changes
  const handleTaskUpdate = (updatedTask: GanttTask) => {
    // Check if task starts before project start date
    if (project && updatedTask.start < project.startDate) {
      toast({
        title: "Task Start Date Error",
        description: "Tasks cannot start before the project start date.",
        variant: "destructive",
      });
      return;
    }

    setGanttData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    }));

    if (project) {
      setProject({
        ...project,
        data: {
          ...project.data,
          tasks: project.data.tasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
          )
        }
      });
      console.log("here")
      setHasUnsavedChanges(true);
    }
  }

  const handleTaskCreate = (newTask: GanttTask) => {
    if (project && newTask.start < project.startDate) {
      toast({
        title: "Task Start Date Error",
        description: "Tasks cannot start before the project start date.",
        variant: "destructive",
      });
      return;
    }

    setGanttData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));

    if (project) {
      setProject({
        ...project,
        data: {
          ...project.data,
          tasks: [...project.data.tasks, newTask]
        }
      });
      setHasUnsavedChanges(true);
    }

    toast({
      title: "Task Created",
      description: `"${newTask.name}" has been added to the project.`,
      duration: 3000,
    });
  };

  const handleTaskDelete = (taskId: string) => {
    setGanttData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));

    if (project) {
      setProject({
        ...project,
        data: {
          ...project.data,
          tasks: project.data.tasks.filter(task => task.id !== taskId)
        }
      });
      setHasUnsavedChanges(true);
    }

    toast({
      title: "Task Deleted",
      description: "The task has been removed from the project.",
      duration: 3000,
    });
  };
  
  // Add state for AI toggle
  const [useAI, setUseAI] = useState(false);
  
  // Add this near other state declarations
  const [modelType, setModelType] = useState<'azure' | 'local'>('azure');
  
  // Update handleSendMessage function
  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: Date.now()
    };
  
    setChatMessages(prev => [...prev, userMessage]);
  
    const processingMessageId = (Date.now() + 1).toString();
    setChatMessages(prev => [
      ...prev,
      {
        id: processingMessageId,
        content: "Processing your request...",
        sender: 'system',
        timestamp: Date.now(),
        isProcessing: true
      }
    ]);
  
    try {
      let result;
      if (useAI) {
        result = modelType === 'azure' 
          ? await processWithAzureLLM(content, ganttData)
          : await processWithLocalLLM(content, ganttData);
      } else {
        result = processChatCommand(content, ganttData);
      }
  
      setGanttData(result.updatedData);
      
      if (project) {
        setProject(prev => ({
          ...prev!,
          data: result.updatedData
        }));
        setHasUnsavedChanges(true);
      }
  
      setChatMessages(prev => [
        ...prev.filter(msg => msg.id !== processingMessageId),
        {
          id: (Date.now() + 2).toString(),
          content: result.response,
          sender: 'system',
          timestamp: Date.now()
        }
      ]);
    } catch (error) {
      setChatMessages(prev => [
        ...prev.filter(msg => msg.id !== processingMessageId),
        {
          id: (Date.now() + 2).toString(),
          content: error instanceof Error ? error.message : "Sorry, I couldn't process your request. Please try again.",
          sender: 'system',
          timestamp: Date.now()
        }
      ]);
    }
  };
  

  const handleDownloadJSON = () => {
    const exportData = {
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      resources: project.resources,
      data: {
        tasks: ganttData.tasks.map(task => ({
          id: task.id,
          name: task.name,
          start: task.start,
          end: task.end,
          progress: task.progress,
          dependencies: task.dependencies,
          milestone: task.milestone,
          color: task.color,
          status: task.status
        })),
        categories: ganttData.categories || [] // Include categories array
      }
    };
  
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project?.name || 'gantt-project'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleBackClick = () => {
    navigate('/projects');
  };
  

  const blocker = useBlocker(
  ({ currentLocation, nextLocation }) => 
    hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );
  
  useEffect(() => {
    if (blocker.state === "blocked" && !hasUnsavedChanges) {
      blocker.reset();
    }
  
    if (blocker.state === "blocked") {
      const proceed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (proceed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, hasUnsavedChanges]);
  
  // Update the back button in the return JSX

  if (!project) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h2 className="text-2xl font-semibold flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-primary" />
              {project.name}
            </h2>
            <p className="text-sm text-gray-500">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <span className="font-medium">{ganttData.tasks.length}</span> Tasks
          </div>
          {hasUnsavedChanges && (
            <Button
              onClick={handleSaveProject}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save Changes
            </Button>
          )}
          <Button
            onClick={handleDownloadJSON}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export JSON
          </Button>
        </div>
      </div>

      <Tabs defaultValue="gantt" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="gantt" className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            Gantt Chart
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gantt" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Task Actions</CardTitle>
                <CardDescription>
                  Edit task details or create new tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskActions
                  tasks={ganttData.tasks}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskCreate={handleTaskCreate}
                  onTaskDelete={handleTaskDelete}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  Drag tasks to adjust dates or resize them to change duration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GanttChart data={ganttData} onTaskUpdate={handleTaskUpdate} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Chat Interface</CardTitle>
                <CardDescription>
                  Use natural language to update your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                // Update the ChatInterface usage
                <ChatInterface
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  tasks={ganttData.tasks}
                  useAI={useAI}
                  onToggleAI={setUseAI}
                  modelType={modelType}
                  onModelChange={setModelType}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  Updates in real-time as you chat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GanttChart data={ganttData} onTaskUpdate={handleTaskUpdate} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectView;