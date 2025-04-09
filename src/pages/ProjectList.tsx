import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, List } from 'lucide-react';
import GanttList from '@/components/GanttList';
import NewGanttForm from '@/components/NewGanttForm';
import { GanttProject } from '@/types/gantt';
import CreateProject from '@/components/CreateProject';
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <List className="mr-2 h-5 w-5 text-primary" />
          Your Projects
        </h2>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
            id="project-import"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('project-import')?.click()}
          >
            Import Project
          </Button>
          <Button size="sm" onClick={() => setShowNewGanttForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <Dialog open={showNewGanttForm} onOpenChange={setShowNewGanttForm}>
        <DialogContent className="sm:max-w-[600px]">
          <CreateProject 
            onSubmit={handleCreateProject}
            onCancel={() => setShowNewGanttForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      <GanttList 
        projects={projects}
        onOpenProject={handleOpenProject}
      />
    </div>
  );
};

export default ProjectList;