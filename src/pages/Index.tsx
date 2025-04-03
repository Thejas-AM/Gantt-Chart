
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import GanttChart from '@/components/GanttChart';
import ChatInterface from '@/components/ChatInterface';
import TaskActions from '@/components/TaskActions';
import { GanttData, GanttTask, ChatMessage } from '@/types/gantt';
import { initialGanttData } from '@/data/initialData';
import { processChatCommand } from '@/utils/chatProcessor';
import { Calendar, MessageSquare, BarChart2 } from 'lucide-react';

const Index = () => {
  const [ganttData, setGanttData] = useState<GanttData>(initialGanttData);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Welcome to ChatGantt! You can update your project by chatting. For example, try 'Add a task Testing from day 18 to day 22'",
      sender: 'system',
      timestamp: Date.now()
    }
  ]);
  const { toast } = useToast();

  const handleTaskUpdate = (updatedTask: GanttTask) => {
    setGanttData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    }));

    toast({
      title: "Task Updated",
      description: `"${updatedTask.name}" has been updated.`,
      duration: 3000,
    });
  };

  const handleTaskCreate = (newTask: GanttTask) => {
    setGanttData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-primary" />
              ChatGantt
            </h1>
            <p className="text-sm text-gray-500">Interactive project planning with natural language</p>
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

export default Index;
