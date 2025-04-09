import { GanttData } from '@/types/gantt';

const AZURE_API_KEY = import.meta.env.VITE_AZURE_API_KEY;
const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT;
const API_VERSION = import.meta.env.VITE_AZURE_API_VERSION;
const DEPLOYMENT_NAME = import.meta.env.VITE_AZURE_DEPLOYMENT_NAME;

const API_URL = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;

const systemPrompt = `You are a Gantt chart task manager. Follow these rules exactly:

1. Only modify tasks when explicitly asked
2. Always return this exact JSON structure:
{
  "tasks": [
    {
      "id": "string (keep existing ID if task exists)",
      "name": "string (task name)",
      "start": number (Unix timestamp in milliseconds),
      "end": number (Unix timestamp in milliseconds),
      "progress": number (between 0 and 100),
      "dependencies": string[] (keep existing unless asked to change),
      "milestone": boolean (true/false),
      "color": "string (hex color like #FF0000)"
      "parent": "string (keep existing unless asked to change)",
    }
  ],
  "message": "string (brief response about what changed)"
}

Important:
- Keep all existing task IDs unchanged
- Keep all existing dependencies unless specifically asked to modify
- If you don't understand a command, keep existing task data unchanged
- All dates must be valid Unix timestamps in milliseconds
- Progress must be between 0 and 100
- Return the complete tasks array, including unmodified tasks`;

export const processWithAzureLLM = async (
    message: string,
    ganttData: GanttData
): Promise<{ updatedData: GanttData; response: string }> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': AZURE_API_KEY,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: `Current tasks: ${JSON.stringify(ganttData.tasks, null, 2)}
Command: ${message}
Project start date: ${new Date(ganttData.tasks[0]?.start || Date.now()).toISOString()}`
                    }
                ],
                temperature: 0.2,
                max_tokens: 1000,
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Azure OpenAI Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error(`Failed to process with Azure OpenAI: ${response.status} ${response.statusText}`);
        }

        const aiResponse = await response.json();
        const parsedResponse = JSON.parse(aiResponse.choices[0].message.content);

        // Validate response structure
        if (!parsedResponse.tasks || !Array.isArray(parsedResponse.tasks)) {
            throw new Error('Invalid response format from AI');
        }

        // Validate each task
        parsedResponse.tasks = parsedResponse.tasks.map(task => ({
            ...task,
            progress: Math.min(100, Math.max(0, task.progress || 0)),
            dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
            color: task.color || '#6366F1'
        }));

        return {
            updatedData: {
                ...ganttData,
                tasks: parsedResponse.tasks
            },
            response: parsedResponse.message || "Task updated successfully"
        };
    } catch (error) {
        console.error('AI Processing Error:', error);
        throw error;
    }
};

const LOCAL_LLM_URL = `${import.meta.env.VITE_OLLAMA_API_URL}/api/generate`;

export const processWithLocalLLM = async (
  message: string,
  ganttData: GanttData
): Promise<{ updatedData: GanttData; response: string }> => {
  try {
    const response = await fetch(LOCAL_LLM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        model: 'mistral',
        prompt: `${systemPrompt}\n\nCurrent tasks: ${JSON.stringify(ganttData.tasks, null, 2)}\nCommand: ${message}`,
        format: "json",
        max_tokens: 1000,
        stream: false
      }),
    });

    console.log('Response:', response); // Debug log

    console.log('Response status:', response.status); // Add debugging

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Local LLM Error Details:', errorData);
      throw new Error(`Failed to process with Local LLM: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Raw LLM response:', result); // Add debugging

    const parsedResponse = JSON.parse(result.response);

    // Validate response structure
    if (!parsedResponse.tasks || !Array.isArray(parsedResponse.tasks)) {
      throw new Error('Invalid response format from LLM');
    }

    // Validate each task
    parsedResponse.tasks = parsedResponse.tasks.map(task => ({
      ...task,
      progress: Math.min(100, Math.max(0, task.progress || 0)),
      dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
      color: task.color || '#6366F1'
    }));

    return {
      updatedData: {
        ...ganttData,
        tasks: parsedResponse.tasks
      },
      response: parsedResponse.message || "Task updated successfully"
    };
  } catch (error) {
    console.error('LLM Processing Error:', error);
    throw error;
  }
};