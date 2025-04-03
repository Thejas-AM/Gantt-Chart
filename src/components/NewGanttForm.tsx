
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar as CalendarIcon, X, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { GanttProject } from '@/types/gantt';
import { initialGanttData } from '@/data/initialData';
import { getCurrentMonday } from '@/utils/dateUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewGanttFormProps {
  onSubmit: (project: GanttProject) => void;
  onCancel: () => void;
}

interface FormValues {
  name: string;
  description: string;
  startDate: Date;
  resources: string[];
}

interface ResourceCategory {
  id: string;
  type: string;
  count: number;
  names: string[];
}

const defaultResourceTypes = [
  'Backend Developer',
  'Frontend Developer',
  'UX Designer',
  'QA Engineer',
  'Project Manager',
  'DevOps Engineer',
  'Data Scientist',
  'Other'
];

const NewGanttForm: React.FC<NewGanttFormProps> = ({ onSubmit, onCancel }) => {
  const [resources, setResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');
  const [resourceCategories, setResourceCategories] = useState<ResourceCategory[]>([]);
  const [newCategoryType, setNewCategoryType] = useState(defaultResourceTypes[0]);
  const [customCategoryType, setCustomCategoryType] = useState('');

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      startDate: getCurrentMonday(),
      resources: [],
    },
  });

  const addResource = () => {
    if (newResource.trim() && !resources.includes(newResource.trim())) {
      setResources([...resources, newResource.trim()]);
      setNewResource('');
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const addResourceCategory = () => {
    const categoryType = newCategoryType === 'Other' && customCategoryType ? 
      customCategoryType.trim() : newCategoryType;
      
    if (categoryType) {
      const newCategory: ResourceCategory = {
        id: `category-${Date.now()}`,
        type: categoryType,
        count: 1,
        names: [''] // Start with one empty name
      };
      setResourceCategories([...resourceCategories, newCategory]);
      setNewCategoryType(defaultResourceTypes[0]);
      setCustomCategoryType('');
    }
  };

  const updateCategoryCount = (categoryId: string, increment: boolean) => {
    setResourceCategories(prevCategories => 
      prevCategories.map(category => {
        if (category.id === categoryId) {
          const newCount = increment ? category.count + 1 : Math.max(1, category.count - 1);
          const newNames = [...category.names];
          
          // Adjust the names array length based on the new count
          if (increment) {
            newNames.push(''); // Add an empty name field
          } else if (newNames.length > newCount) {
            newNames.pop(); // Remove the last name field
          }
          
          return {
            ...category,
            count: newCount,
            names: newNames
          };
        }
        return category;
      })
    );
  };

  const updateResourceName = (categoryId: string, index: number, name: string) => {
    setResourceCategories(prevCategories => 
      prevCategories.map(category => {
        if (category.id === categoryId) {
          const newNames = [...category.names];
          newNames[index] = name;
          return {
            ...category,
            names: newNames
          };
        }
        return category;
      })
    );
  };

  const removeResourceCategory = (categoryId: string) => {
    setResourceCategories(resourceCategories.filter(category => category.id !== categoryId));
  };

  const handleSubmit = (values: FormValues) => {
    // Collect all named resources from categories
    const categoryResources: string[] = resourceCategories.flatMap(category => 
      category.names.filter(name => name.trim() !== '')
        .map(name => `${category.type}: ${name.trim()}`)
    );
    
    // Add unnamed resources with just their category
    const unnamedCategoryResources: string[] = resourceCategories.map(category => 
      `${category.type} (${category.count})`
    );
    
    // Combine all resources
    const allResources = [
      ...resources,
      ...categoryResources,
      ...unnamedCategoryResources.filter(r => !categoryResources.some(cr => cr.startsWith(r.split(' (')[0])))
    ];

    const newProject: GanttProject = {
      id: `project-${Date.now()}`,
      name: values.name,
      description: values.description,
      startDate: values.startDate.getTime(),
      resources: allResources,
      data: {
        ...initialGanttData,
        tasks: initialGanttData.tasks.map(task => ({
          ...task,
          start: values.startDate.getTime() + (task.start - initialGanttData.tasks[0].start),
          end: values.startDate.getTime() + (task.end - initialGanttData.tasks[0].start),
        })),
      },
    };
    
    onSubmit(newProject);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter project description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Project tasks cannot be scheduled before this date
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Resource Categories Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Resource Categories</FormLabel>
          </div>
          
          <div className="flex flex-col space-y-4 mb-4">
            {resourceCategories.map((category, catIndex) => (
              <div key={category.id} className="border p-4 rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{category.type}</h4>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeResourceCategory(category.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 mb-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateCategoryCount(category.id, false)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{category.count}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateCategoryCount(category.id, true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground ml-2">
                    {category.count === 1 ? 'resource' : 'resources'}
                  </span>
                </div>
                
                {/* Optional name fields */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Optional: Name your resources</p>
                  {category.names.map((name, index) => (
                    <Input
                      key={`${category.id}-name-${index}`}
                      placeholder={`${category.type} ${index + 1} name (optional)`}
                      value={name}
                      onChange={(e) => updateResourceName(category.id, index, e.target.value)}
                      className="text-sm"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Add new resource category */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Select 
                value={newCategoryType} 
                onValueChange={setNewCategoryType}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  {defaultResourceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addResourceCategory}
                className="ml-2"
              >
                Add Category
              </Button>
            </div>
            
            {newCategoryType === 'Other' && (
              <Input
                placeholder="Custom resource type"
                value={customCategoryType}
                onChange={(e) => setCustomCategoryType(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>
        
        {/* Individual Resources Section */}
        <div className="space-y-2">
          <FormLabel>Additional Resources</FormLabel>
          <div className="flex space-x-2">
            <Input
              placeholder="Add other team member or resource"
              value={newResource}
              onChange={(e) => setNewResource(e.target.value)}
              className="flex-1"
            />
            <Button type="button" onClick={addResource}>
              Add
            </Button>
          </div>
          <FormDescription>
            Add individual team members or other resources not covered by categories
          </FormDescription>
          
          {resources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {resources.map((resource, index) => (
                <div key={index} className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                  {resource}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-1"
                    onClick={() => removeResource(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Create Project
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewGanttForm;
