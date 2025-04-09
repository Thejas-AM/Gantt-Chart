import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, List } from 'lucide-react';
import GanttList from '@/components/GanttList';
import NewGanttForm from '@/components/NewGanttForm';
import { GanttProject } from '@/types/gantt';

const ProjectList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showNewGanttForm, setShowNewGanttForm] = useState(false);
  const [projects, setProjects] = useState<GanttProject[]>([]);

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
    navigate(`/project/${projectId}`);
  };

  const handleImportProject = (importedProject: GanttProject) => {
    try {
      const newProject = {
        ...importedProject
      };
      setProjects(prev => [...prev, newProject]);
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

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedProject = JSON.parse(e.target?.result as string);
          if (importedProject.id && importedProject.name && importedProject.data) {
            handleImportProject(importedProject);
          }
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid project file format",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center">
          <List className="mr-2 h-6 w-6 text-primary" />
          Your Projects
        </h2>
        <div className="flex gap-4">
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
            id="project-import"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('project-import')?.click()}
          >
            Import Project
          </Button>
          <Button onClick={() => setShowNewGanttForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
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
      />
    </div>
  );
};

export default ProjectList;