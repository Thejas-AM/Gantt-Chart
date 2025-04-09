import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import NewGanttForm from '@/components/NewGanttForm';
import { GanttProject } from '@/types/gantt';

interface CreateProjectProps {
  onSubmit: (project: GanttProject) => void;
  onCancel: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onSubmit, onCancel }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogDescription>
          Fill in the details to create a new Gantt chart project
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <NewGanttForm 
          onSubmit={onSubmit} 
          onCancel={onCancel} 
        />
      </div>
    </>
  );
};

export default CreateProject;