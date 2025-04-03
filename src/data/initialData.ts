
import { GanttData, ChatMessage } from '@/types/gantt';
import { addDays, getCurrentMonday, dateToTimestamp } from '@/utils/dateUtils';

// Get the current Monday as the project start date
const projectStart = getCurrentMonday();

export const initialGanttData: GanttData = {
  tasks:[],
//   [
//     {
//         "id": "task1",
//         "name": "Planning Phase",
//         "start": 1743406224508,
//         "end": 1743838224508,
//         "progress": 100,
//         "dependencies": [],
//         "color": "#6366F1",
//         "status": "completed"
//     },
//     {
//         "id": "task2",
//         "name": "Research",
//         "start": 1743665424508,
//         "end": 1744097424508,
//         "progress": 70,
//         "dependencies": [
//             "task1"
//         ],
//         "color": "#6366F1",
//         "status": "in-progress"
//     },
//     {
//         "id": "milestone1",
//         "name": "Research Complete",
//         "start": 1744097424508,
//         "end": 1744097424508,
//         "progress": 0,
//         "milestone": true,
//         "dependencies": [
//             "task2"
//         ],
//         "color": "#F59E0B",
//         "status": "not-started"
//     },
//     {
//         "id": "task3",
//         "name": "Design Phase",
//         "start": 1744183824508,
//         "end": 1744615824508,
//         "progress": 20,
//         "dependencies": [
//             "milestone1"
//         ],
//         "color": "#6366F1",
//         "status": "in-progress"
//     },
//     {
//         "id": "task4",
//         "name": "Development",
//         "start": 1744443024508,
//         "end": 1745134224508,
//         "progress": 0,
//         "dependencies": [
//             "task3"
//         ],
//         "color": "#6366F1",
//         "status": "not-started"
//     },
//     {
//         "id": "task1743666830763",
//         "name": "dskhd",
//         "start": 1743407624264,
//         "end": 1743839624264,
//         "progress": 0,
//         "color": "#6366F1",
//         "status": "not-started",
//         "dependencies": []
//     },
//     {
//         "id": "task1743666837651",
//         "name": "dskcdskjhk",
//         "start": 1743407630452,
//         "end": 1743839630452,
//         "progress": 0,
//         "color": "#6366F1",
//         "status": "not-started",
//         "dependencies": []
//     }
// ],
  //  [
  //   {
  //     id: 'task1',
  //     name: 'Planning Phase',
  //     start: dateToTimestamp(projectStart),
  //     end: dateToTimestamp(addDays(projectStart, 5)),
  //     progress: 100,
  //     dependencies: [],
  //     color: '#6366F1',
  //     status: 'completed'
  //   },
  //   {
  //     id: 'task2',
  //     name: 'Research',
  //     start: dateToTimestamp(addDays(projectStart, 3)),
  //     end: dateToTimestamp(addDays(projectStart, 8)),
  //     progress: 70,
  //     dependencies: ['task1'],
  //     color: '#6366F1',
  //     status: 'in-progress'
  //   },
  //   {
  //     id: 'milestone1',
  //     name: 'Research Complete',
  //     start: dateToTimestamp(addDays(projectStart, 8)),
  //     end: dateToTimestamp(addDays(projectStart, 8)),
  //     progress: 0,
  //     milestone: true,
  //     dependencies: ['task2'],
  //     color: '#F59E0B',
  //     status: 'not-started'
  //   },
  //   {
  //     id: 'task3',
  //     name: 'Design Phase',
  //     start: dateToTimestamp(addDays(projectStart, 9)),
  //     end: dateToTimestamp(addDays(projectStart, 14)),
  //     progress: 20,
  //     dependencies: ['milestone1'],
  //     color: '#6366F1',
  //     status: 'in-progress'
  //   },
  //   {
  //     id: 'task4',
  //     name: 'Development',
  //     start: dateToTimestamp(addDays(projectStart, 12)),
  //     end: dateToTimestamp(addDays(projectStart, 20)),
  //     progress: 0,
  //     dependencies: ['task3'],
  //     color: '#6366F1',
  //     status: 'not-started'
  //   }
  // ],
  categories: [
    { id: 'cat1', name: 'Project Phases' }
  ]
};

export const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    content: "Welcome to ChatGantt! You can update your project by chatting. For example, try 'Add a task Testing from day 18 to day 22'",
    sender: 'system',
    timestamp: Date.now()
  }
];
