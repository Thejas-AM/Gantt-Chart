
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Clock } from 'lucide-react';
import { GanttProject } from '@/types/gantt';
import { format } from 'date-fns';

interface GanttListProps {
  projects: GanttProject[];
  onOpenProject: (projectId: string) => void;
  onImportProject: (project: GanttProject) => void;  // Add this prop
}

const GanttList: React.FC<GanttListProps> = ({ projects, onOpenProject, onImportProject }) => {
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedProject = JSON.parse(e.target?.result as string);
          if (importedProject.id && importedProject.name && importedProject.data) {
            console.log('Imported project:', importedProject);
            onImportProject(importedProject);
          }
        } catch (error) {
          console.error('Failed to import project:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  if (!projects.length) {
    return (
      <Card className="text-center p-8 border-dashed border-2">
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">No projects yet. Create one to get started!</p>
          <div>
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
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import Project
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const taskCount = project.data.tasks.length;
          const completedTasks = project.data.tasks.filter(task => task.status === 'completed').length;
          const progressPercentage = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge variant={progressPercentage === 100 ? "success" : "default"}>
                    {progressPercentage}% Complete
                  </Badge>
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Started: {format(new Date(project.startDate), 'PPP')}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {taskCount} tasks ({completedTasks} completed)
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => onOpenProject(project.id)} className="w-full">
                  Open Project <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GanttList;
