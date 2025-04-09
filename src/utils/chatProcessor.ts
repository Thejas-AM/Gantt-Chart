
import { GanttData, GanttTask } from '@/types/gantt';
import { addDays, dateToTimestamp, timestampToDate, getCurrentMonday } from '@/utils/dateUtils';

// This is a simple mock of an LLM processor that can handle basic natural language commands
// In a real application, this would be replaced with an actual LLM API call
export const processChatCommand = (
  message: string,
  ganttData: GanttData
): { updatedData: GanttData; response: string } => {
  message = message.toLowerCase();
  let updatedData = { ...ganttData, tasks: [...ganttData.tasks] };
  let response = '';

  try {
    // Command: Add a task
    if (message.includes('add') && message.includes('task')) {
      const taskNameMatch = message.match(/add(?:\sa)?\stask\s['"]([^'"]+)['"]/i) 
        || message.match(/add(?:\sa)?\stask\s([^'"]+?)\sfrom/i);
      
      const fromMatch = message.match(/from\s(?:day\s)?(\d+)/i) 
        || message.match(/from\s(\w+\s\d+)/i);
      
      const toMatch = message.match(/to\s(?:day\s)?(\d+)/i)
        || message.match(/to\s(\w+\s\d+)/i);

      if (taskNameMatch && (fromMatch || toMatch)) {
        const taskName = taskNameMatch[1].trim();
        
        // Parse dates
        let startDate, endDate;
        const projectStart = getCurrentMonday();
        
        if (fromMatch && fromMatch[1].match(/^\d+$/)) {
          // If it's a day number
          const dayNumber = parseInt(fromMatch[1]);
          startDate = addDays(projectStart, dayNumber - 1);
        } else if (fromMatch) {
          // Try to parse as date string
          startDate = new Date(fromMatch[1]);
        } else {
          // Default to today
          startDate = new Date();
        }
        
        if (toMatch && toMatch[1].match(/^\d+$/)) {
          // If it's a day number
          const dayNumber = parseInt(toMatch[1]);
          endDate = addDays(projectStart, dayNumber - 1);
        } else if (toMatch) {
          // Try to parse as date string
          endDate = new Date(toMatch[1]);
        } else {
          // Default to start + 5 days
          endDate = addDays(startDate, 5);
        }
        
        // Make sure dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Couldn't understand the dates in your request");
        }
        
        // Make sure end date is after start date
        if (startDate > endDate) {
          const temp = startDate;
          startDate = endDate;
          endDate = temp;
        }
        
        // Create new task
        const newTask: GanttTask = {
          id: `task${Date.now()}`,
          name: taskName,
          start: dateToTimestamp(startDate),
          end: dateToTimestamp(endDate),
          progress: 0,
          dependencies: [],
          color: '#6366F1',
          parent: ''
        };
        
        updatedData.tasks.push(newTask);
        response = `Added task "${taskName}" from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.`;
      } else {
        throw new Error("Couldn't understand your request to add a task");
      }
    }
    
    // Command: Update task progress
    else if ((message.includes('update') || message.includes('set')) && 
             message.includes('progress')) {
      const taskNameMatch = message.match(/(?:update|set)\s(?:task\s)?['"]([^'"]+)['"]\sprogress/i)
        || message.match(/(?:update|set)\s(?:task\s)?([^'"]+?)\sprogress/i);
        
      const progressMatch = message.match(/progress\s(?:to\s)?(\d+)%?/i)
        || message.match(/progress\s(?:to\s)?(\d+)\s?percent/i);
        
      if (taskNameMatch && progressMatch) {
        const taskName = taskNameMatch[1].trim();
        const progress = Math.min(100, Math.max(0, parseInt(progressMatch[1])));
        
        const taskIndex = updatedData.tasks.findIndex(t => 
          t.name.toLowerCase() === taskName.toLowerCase());
          
        if (taskIndex >= 0) {
          updatedData.tasks[taskIndex] = {
            ...updatedData.tasks[taskIndex],
            progress
          };
          response = `Updated progress for task "${taskName}" to ${progress}%.`;
        } else {
          throw new Error(`Task "${taskName}" not found`);
        }
      } else {
        throw new Error("Couldn't understand your request to update progress");
      }
    }
    
    // Command: Extend task
    else if (message.includes('extend') && message.includes('task')) {
      const taskNameMatch = message.match(/extend\s(?:task\s)?['"]([^'"]+)['"]/i)
        || message.match(/extend\s(?:task\s)?([^'"]+?)\sby/i);
        
      const daysMatch = message.match(/by\s(\d+)\sdays?/i);
        
      if (taskNameMatch && daysMatch) {
        const taskName = taskNameMatch[1].trim();
        const days = parseInt(daysMatch[1]);
        
        const taskIndex = updatedData.tasks.findIndex(t => 
          t.name.toLowerCase() === taskName.toLowerCase());
          
        if (taskIndex >= 0) {
          const task = updatedData.tasks[taskIndex];
          const endDate = addDays(timestampToDate(task.end), days);
          
          updatedData.tasks[taskIndex] = {
            ...task,
            end: dateToTimestamp(endDate)
          };
          
          response = `Extended task "${taskName}" by ${days} days to end on ${endDate.toLocaleDateString()}.`;
        } else {
          throw new Error(`Task "${taskName}" not found`);
        }
      } else {
        throw new Error("Couldn't understand your request to extend a task");
      }
    }
    
    // Command: Delete/remove task
    else if ((message.includes('delete') || message.includes('remove')) && message.includes('task')) {
      const taskNameMatch = message.match(/(?:delete|remove)\s(?:task\s)?['"]([^'"]+)['"]/i)
        || message.match(/(?:delete|remove)\s(?:task\s)?([^'"]+)/i);
        
      if (taskNameMatch) {
        const taskName = taskNameMatch[1].trim();
        
        const taskIndex = updatedData.tasks.findIndex(t => 
          t.name.toLowerCase() === taskName.toLowerCase());
          
        if (taskIndex >= 0) {
          const deletedTask = updatedData.tasks[taskIndex];
          
          // Remove the task
          updatedData.tasks.splice(taskIndex, 1);
          
          // Remove dependencies to this task
          updatedData.tasks = updatedData.tasks.map(task => ({
            ...task,
            dependencies: task.dependencies ? 
              task.dependencies.filter(dep => dep !== deletedTask.id) : 
              []
          }));
          
          response = `Removed task "${taskName}" from the project.`;
        } else {
          throw new Error(`Task "${taskName}" not found`);
        }
      } else {
        throw new Error("Couldn't understand your request to delete a task");
      }
    }
    
    // Command: Add a milestone
    else if (message.includes('add') && message.includes('milestone')) {
      const nameMatch = message.match(/add(?:\sa)?\smilestone\s['"]([^'"]+)['"]/i) 
        || message.match(/add(?:\sa)?\smilestone\s([^'"]+?)\son/i);
      
      const dateMatch = message.match(/on\s(?:day\s)?(\d+)/i) 
        || message.match(/on\s(\w+\s\d+)/i);

      if (nameMatch && dateMatch) {
        const milestoneName = nameMatch[1].trim();
        
        // Parse date
        let milestoneDate;
        const projectStart = getCurrentMonday();
        
        if (dateMatch[1].match(/^\d+$/)) {
          // If it's a day number
          const dayNumber = parseInt(dateMatch[1]);
          milestoneDate = addDays(projectStart, dayNumber - 1);
        } else {
          // Try to parse as date string
          milestoneDate = new Date(dateMatch[1]);
        }
        
        // Make sure date is valid
        if (isNaN(milestoneDate.getTime())) {
          throw new Error("Couldn't understand the date in your request");
        }
        
        // Create new milestone
        const timestamp = dateToTimestamp(milestoneDate);
        const newMilestone: GanttTask = {
          id: `milestone${Date.now()}`,
          name: milestoneName,
          start: timestamp,
          end: timestamp,
          progress: 0,
          milestone: true,
          dependencies: [],
          color: '#F59E0B',
          parent: ''
        };
        
        updatedData.tasks.push(newMilestone);
        response = `Added milestone "${milestoneName}" on ${milestoneDate.toLocaleDateString()}.`;
      } else {
        throw new Error("Couldn't understand your request to add a milestone");
      }
    }
    
    // Command: Add dependency
    else if (message.includes('add') && message.includes('dependency')) {
      const fromMatch = message.match(/from\s['"]([^'"]+)['"]\sto\s['"]([^'"]+)['"]/i)
        || message.match(/from\s([^'"]+?)\sto\s([^'"]+)/i);
        
      if (fromMatch) {
        const fromTaskName = fromMatch[1].trim();
        const toTaskName = fromMatch[2].trim();
        
        const fromTask = updatedData.tasks.find(t => 
          t.name.toLowerCase() === fromTaskName.toLowerCase());
          
        const toTask = updatedData.tasks.find(t => 
          t.name.toLowerCase() === toTaskName.toLowerCase());
          
        if (fromTask && toTask) {
          // Add dependency
          toTask.dependencies = [...(toTask.dependencies || []), fromTask.id];
          
          // Update the tasks array
          updatedData.tasks = updatedData.tasks.map(t => 
            t.id === toTask.id ? toTask : t
          );
          
          response = `Added dependency from "${fromTaskName}" to "${toTaskName}".`;
        } else {
          throw new Error(`One or both tasks not found`);
        }
      } else {
        throw new Error("Couldn't understand your request to add a dependency");
      }
    }
    
    // Default response for unrecognized commands
    else {
      response = "I'm not sure how to process that request. Try commands like 'Add a task Design from day 5 to day 10' or 'Update task Research progress to 50%'.";
    }
  } catch (error) {
    response = error instanceof Error ? error.message : "Sorry, I couldn't process your request.";
  }

  return { updatedData, response };
};

// Add this function at the top of the file
export const getChatSuggestions = (input: string, tasks: GanttTask[]): string[] => {
  input = input.toLowerCase();
  const suggestions: string[] = [];

  const commands = [
    'add task "Task Name" from day 1 to day 5',
    'update task "Task Name" progress to 50%',
    'extend task "Task Name" by 5 days',
    'delete task "Task Name"',
    'add milestone "Milestone Name" on day 10',
    'add dependency from "Task A" to "Task B"'
  ];

  if (input.startsWith('add')) {
    suggestions.push(...commands.filter(cmd => cmd.startsWith('add')));
  } else if (input.startsWith('update')) {
    suggestions.push(...tasks.map(task => `update task "${task.name}" progress to `));
  } else if (input.startsWith('extend')) {
    suggestions.push(...tasks.map(task => `extend task "${task.name}" by `));
  } else if (input.startsWith('delete')) {
    suggestions.push(...tasks.map(task => `delete task "${task.name}"`));
  } else if (input.includes('task') && tasks.length > 0) {
    suggestions.push(...tasks.map(task => `"${task.name}"`));
  } else {
    suggestions.push(...commands);
  }

  return suggestions
    .filter(suggestion => suggestion.toLowerCase().includes(input))
    .slice(0, 5);
};
