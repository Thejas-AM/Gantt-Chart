import { GanttTask } from '@/types/gantt';

export const sortGanttTasks = (tasks: GanttTask[]): GanttTask[] => {
  const taskGroups: { [key: string]: GanttTask[] } = {};
  const parentlessTasks: GanttTask[] = [];

  tasks.forEach(task => {
    if (task.feature) {
      if (!taskGroups[task.feature]) {
        taskGroups[task.feature] = [];
      }
      taskGroups[task.feature].push(task);
    } else {
      parentlessTasks.push(task);
    }
  });

  // Sort each group by start date
  Object.keys(taskGroups).forEach(groupKey => {
    taskGroups[groupKey].sort((a, b) => a.start - b.start);
  });

  // Sort parentless tasks by start date
  parentlessTasks.sort((a, b) => a.start - b.start);

  // Sort groups by their earliest task's start date
  const sortedGroups = Object.entries(taskGroups)
    .sort(([, groupA], [, groupB]) => {
      const groupAStart = Math.min(...groupA.map(task => task.start));
      const groupBStart = Math.min(...groupB.map(task => task.start));
      return groupAStart - groupBStart;
    });

  // Combine all sorted tasks
  const sortedTasks = [...parentlessTasks];
  sortedGroups.forEach(([, group]) => {
    sortedTasks.push(...group);
  });

  return sortedTasks;
};