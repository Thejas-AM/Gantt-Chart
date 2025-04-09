
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
}

const GanttList: React.FC<GanttListProps> = ({ projects, onOpenProject }) => {
  if (!projects.length) {
    return (
      <Card className="text-center p-8 border-dashed border-2">
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">No projects yet. Create one to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const taskCount = project.data.tasks.length;
        const completedTasks = project.data.tasks.filter(task => task.status === 'completed').length;
        const progressPercentage = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

        return (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <CardTitle 
                  className="text-lg truncate max-w-[70%] cursor-default" 
                  title={project.name}
                >
                  {project.name}
                </CardTitle>
                <Badge variant={progressPercentage === 100 ? "success" : "default"} className="shrink-0">
                  {progressPercentage}% Complete
                </Badge>
              </div>
              <CardDescription 
                className="line-clamp-2 min-h-[40px] cursor-default"
                title={project.description}
              >
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{format(new Date(project.startDate), 'PPP')}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{taskCount} tasks ({completedTasks} completed)</span>
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
  );
};

export default GanttList;
