import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import GanttChart from '@/components/GanttChart';
import ChatInterface from '@/components/ChatInterface';
import TaskActions from '@/components/TaskActions';
import { GanttData, GanttTask, ChatMessage, GanttProject } from '@/types/gantt';
import { processChatCommand } from '@/utils/chatProcessor';
import { Calendar, MessageSquare, BarChart2, ArrowLeft } from 'lucide-react';
import { initialGanttData } from '@/data/initialData';
import { getCurrentMonday } from '@/utils/dateUtils';

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

  useEffect(() => {
    // Mock fetching the project
    // In a real app, this would be an API call
    console.log("Loading project with ID:", projectId);
    
    // Create a mock project or attempt to load from localStorage
    let mockProject: GanttProject;
    
    try {
      // Try to load from localStorage if it exists
      const savedProject = localStorage.getItem(`project_${projectId}`);
      if (savedProject) {
        mockProject = JSON.parse(savedProject);
        console.log("Loaded project from localStorage:", mockProject);
      } else {
        // Create a new mock project
        mockProject = {
          id: projectId || 'default-1',
          name: 'Sample Project',
          description: 'A sample project to demonstrate the app',
          startDate: getCurrentMonday().getTime(),
          resources: ['Team Member 1', 'Team Member 2'],
          data: initialGanttData
        };
        console.log("Created new mock project:", mockProject);
      }
    } catch (error) {
      console.error("Error loading project:", error);
      // Fallback to a new mock project
      mockProject = {
        id: projectId || 'default-1',
        name: 'Sample Project',
        description: 'A sample project to demonstrate the app',
        startDate: Date.now(),
        resources: ['Team Member 1', 'Team Member 2'],
        data: initialGanttData
      };
    }
    
    // Validate all tasks have proper start and end dates
    const validatedTasks = mockProject.data.tasks.filter(
      task => task && typeof task.start === 'number' && typeof task.end === 'number'
    );
    
    // Update the project with validated tasks
    mockProject.data.tasks = validatedTasks;
    
    setProject(mockProject);
    setGanttData(mockProject.data);
  }, [projectId]);

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
    }

    toast({
      title: "Task Updated",
      description: `"${updatedTask.name}" has been updated.`,
      duration: 3000,
    });
  };

  const handleTaskCreate = (newTask: GanttTask) => {
    console.log(newTask)
    // Check if task starts before project start date
    console.log(ganttData)
    if (project && newTask.start < project.startDate) {
      toast({
        title: "Task Start Date Error",
        description: "Tasks cannot start before the project start date.",
        variant: "destructive",
      });
      console.log("djtsdyudyus",newTask.start,project.startDate)
      return;
    }
    console.log("here")
    setGanttData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
    console.log(ganttData)

    if (project) {
      setProject({
        ...project,
        data: {
          ...project.data,
          tasks: [...project.data.tasks, newTask]
        }
      });
    }

    toast({
      title: "Task Created",
      description: `"${newTask.name}" has been added to the project.`,
      duration: 3000,
    });
  };

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: Date.now()
    };

    // Add user message to chat
    setChatMessages(prev => [...prev, userMessage]);

    // Add a processing message
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

    // Process the message
    setTimeout(() => {
      try {
        const { updatedData, response } = processChatCommand(content, ganttData);
        
        // Update Gantt data
        setGanttData(updatedData);
        
        // Remove processing message and add response
        setChatMessages(prev => [
          ...prev.filter(msg => msg.id !== processingMessageId),
          {
            id: (Date.now() + 2).toString(),
            content: response,
            sender: 'system',
            timestamp: Date.now()
          }
        ]);
      } catch (error) {
        // Remove processing message and add error
        setChatMessages(prev => [
          ...prev.filter(msg => msg.id !== processingMessageId),
          {
            id: (Date.now() + 2).toString(),
            content: "Sorry, I couldn't process your request. Please try again.",
            sender: 'system',
            timestamp: Date.now()
          }
        ]);
      }
    }, 1000); // Simulate processing time
  };

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="mr-2 h-6 w-6 text-primary" />
                {project.name}
              </h1>
              <p className="text-sm text-gray-500">{project.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <span className="font-medium">{ganttData.tasks.length}</span> Tasks
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
      </main>
    </div>
  );
};

export default ProjectView;
