
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Calendar, List } from 'lucide-react';
import GanttList from '@/components/GanttList';
import NewGanttForm from '@/components/NewGanttForm';
import { GanttProject } from '@/types/gantt';
import { initialGanttData } from '@/data/initialData';

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNewGanttForm, setShowNewGanttForm] = useState(false);
  const [projects, setProjects] = useState<GanttProject[]>([]);

  const handleLogin = () => {
    // Simulate login process
    setIsLoggedIn(true);
    toast({
      title: "Logged in successfully",
      description: "Welcome to ChatGantt!",
    });
  };

  // Add this useEffect after the state declarations
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('gantt-projects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
        toast({
          title: "Projects Loaded",
          description: `Loaded ${parsedProjects.length} projects from storage`,
        });
      }
    } catch (error) {
      toast({
        title: "Error Loading Projects",
        description: "Failed to load saved projects",
        variant: "destructive",
      });
    }
  }, []);

  // Update handleCreateProject to save to localStorage
  const handleCreateProject = (project: GanttProject) => {
    setProjects(prev => {
      const updatedProjects = [...prev, project];
      localStorage.setItem('gantt-projects', JSON.stringify(updatedProjects));
      return updatedProjects;
    });
    setShowNewGanttForm(false);
    toast({
      title: "Project Created",
      description: `"${project.name}" has been created successfully.`,
    });
  };

  const handleOpenProject = (projectId: string) => {
    // In a real application, we would load the project data here
    // For now, we'll just navigate to the project page
    navigate(`/project/${projectId}`);
  };

  const handleImportProject = (importedProject: GanttProject) => {
    try {
      // Generate a new ID to avoid conflicts
      const newProject = {
        ...importedProject
      };

      // Add the project to state
      setProjects(prev => [...prev, newProject]);

      // Save to localStorage
      const existingProjects = JSON.parse(localStorage.getItem('gantt-projects') || '[]');
      localStorage.setItem('gantt-projects', JSON.stringify([...existingProjects, newProject]));

      toast({
        title: "Project Imported",
        description: `Successfully imported project: ${newProject.name}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import project. Please check the file format.",
        variant: "destructive",
      });
    }
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
          
          <div>
            {!isLoggedIn ? (
              <Button onClick={handleLogin}>
                Log in
              </Button>
            ) : (
              <Button variant="ghost" className="text-sm text-gray-500">
                Welcome, User
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!isLoggedIn ? (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-center">Welcome to ChatGantt</CardTitle>
              <CardDescription className="text-center">
                Log in to create and manage your Gantt charts
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={handleLogin} size="lg">
                Log in to get started
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <List className="mr-2 h-5 w-5" />
                Your Projects
              </h2>
              <Button onClick={() => setShowNewGanttForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </div>
            
            {showNewGanttForm && (
              <Card className="mb-6 border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>Create New Project</CardTitle>
                  <CardDescription>
                    Fill in the details to create a new Gantt chart project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NewGanttForm 
                    onSubmit={handleCreateProject} 
                    onCancel={() => setShowNewGanttForm(false)} 
                  />
                </CardContent>
              </Card>
            )}
            
            <GanttList 
              projects={projects}
              onOpenProject={handleOpenProject}
              onImportProject={handleImportProject}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
