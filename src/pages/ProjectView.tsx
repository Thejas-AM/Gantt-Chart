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
import { Calendar, MessageSquare, BarChart2, ArrowLeft, Download, Save } from 'lucide-react';
import { initialGanttData } from '@/data/initialData';
import { processWithAzureCustomLLM, processWithAzureLLM, processWithCustomLLM, processWithLocalLLM } from '@/services/azureLLM';
import { sortGanttTasks } from '@/utils/sortUtils';
import { exportToCSV } from '@/utils/exportUtils';
import { ICustomLLMConfig, ModelType } from '@/types/llm';

const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
          // Sort tasks before setting project and ganttData
          const sortedTasks = sortGanttTasks(currentProject.data.tasks);
          setProject({
            ...currentProject,
            data: {
              ...currentProject.data,
              tasks: sortedTasks
            }
          });
          setGanttData({
            ...currentProject.data,
            tasks: sortedTasks
          });
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
        p.id === project.id ? { ...project, data: ganttData } : p
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
      tasks: sortGanttTasks(prev.tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      ))
    }));

    if (project) {
      setProject({
        ...project,
        data: {
          ...project.data,
          tasks: sortGanttTasks(project.data.tasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
          ))
        }
      });
      setHasUnsavedChanges(true);
    }
  }
  const handleTaskCreate = (newTask: GanttTask) => {
    console.log(project, newTask.start)
    if (project && newTask.start < project.startDate) {
      toast({
        title: "Task Start Date Error",
        description: "Tasks cannot start before the project start date.",
        variant: "destructive",
      });
      return;
    }

    setGanttData(prev => {
      const updatedTasks = sortGanttTasks([...prev.tasks, newTask]);
      return {
        ...prev,
        tasks: updatedTasks
      };
    });

    if (project) {
      setProject(prev => {
        const updatedTasks = sortGanttTasks([...prev!.data.tasks, newTask]);
        return {
          ...prev!,
          data: {
            ...prev!.data,
            tasks: updatedTasks
          }
        };
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
      tasks: prev.tasks
        .filter(task => task.id !== taskId)
        .map(task => ({
          ...task,
          dependencies: task.dependencies.filter(depId => depId !== taskId)
        }))
    }));

    if (project) {
      setProject({
        ...project,
        data: {
          ...project.data,
          tasks: project.data.tasks
            .filter(task => task.id !== taskId)
            .map(task => ({
              ...task,
              dependencies: task.dependencies.filter(depId => depId !== taskId)
            }))
        }
      });
      setHasUnsavedChanges(true);
    }

    toast({
      title: "Task Deleted",
      description: "The task and its dependencies have been removed from the project.",
      duration: 3000,
    });
  };

  // Add state for AI toggle
  const [useAI, setUseAI] = useState(false);

  // Update modelType to include azure-custom
  // Replace the modelType state
  const [modelType, setModelType] = useState<ModelType>(ModelType.Azure);

  // Add Azure custom config state
  const [customConfig, setCustomConfig] = useState<ICustomLLMConfig>({
    endpoint: '',
    apiKey: '',
    modelName: '',
    isConfigured: false
  });
  const [azureCustomConfig, setAzureCustomConfig] = useState<ICustomLLMConfig>({
    endpoint: '',
    apiKey: '',
    modelName: '',
    isConfigured: false
  });

  // Update the handleSendMessage function
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
        if (modelType === 'custom') {
          if (!customConfig.endpoint || !customConfig.apiKey || !customConfig.modelName) {
            throw new Error('Please configure all custom LLM settings');
          }
          result = await processWithCustomLLM(content, ganttData, customConfig);
        } else if (modelType === 'azure-custom') {
          if (!azureCustomConfig.endpoint || !azureCustomConfig.apiKey || !azureCustomConfig.modelName) {
            throw new Error('Please configure all Azure custom LLM settings');
          }
          result = await processWithAzureCustomLLM(content, ganttData, azureCustomConfig);
        } else {
          result = modelType === 'azure'
            ? await processWithAzureLLM(content, ganttData)
            : await processWithLocalLLM(content, ganttData);
        }
      } else {
        result = processChatCommand(content, ganttData);
      }

      // Sort the tasks from LLM response
      const sortedData = {
        ...result.updatedData,
        tasks: sortGanttTasks(result.updatedData.tasks)
      };

      setGanttData(sortedData);

      if (project) {
        setProject(prev => ({
          ...prev!,
          data: sortedData
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
          status: task.status,
          feature: task.feature
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
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-4 shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold flex items-center truncate" title={project.name}>
              <Calendar className="mr-2 h-6 w-6 text-primary shrink-0" />
              {project.name}
            </h2>
            <p className="text-sm text-gray-500 truncate" title={project.description}>
              {project.description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 shrink-0">
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
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          )}
          <Button
            onClick={handleDownloadJSON}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToCSV(ganttData)}
            className="ml-2"
          >
            Export to CSV
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
                <ChatInterface
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  tasks={ganttData.tasks}
                  useAI={useAI}
                  onToggleAI={setUseAI}
                  modelType={modelType}
                  onModelChange={setModelType}
                  customConfig={customConfig}
                  onCustomConfigChange={setCustomConfig}
                  azureCustomConfig={azureCustomConfig}
                  onAzureCustomConfigChange={setAzureCustomConfig}
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