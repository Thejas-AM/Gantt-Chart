import { GanttData } from '@/types/gantt';

const AZURE_API_KEY = import.meta.env.VITE_AZURE_API_KEY;
const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT;
const API_VERSION = import.meta.env.VITE_AZURE_API_VERSION;
const DEPLOYMENT_NAME = import.meta.env.VITE_AZURE_DEPLOYMENT_NAME;

const API_URL = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;

const systemPrompt = `You are a Gantt chart task manager. Your role is to:
1. Parse natural language requests for task management
2. Return JSON responses in this exact structure:
{
  "tasks": [
    {
      "id": "string",
      "name": "string",
      "start": number (timestamp),
      "end": number (timestamp),
      "progress": number (0-100),
      "dependencies": string[],
      "milestone": boolean,
      "color": "string (hex color)"
    }
  ],
  "message": "string (response message)"
}
3. Maintain existing task IDs when updating
4. Ensure dates are valid timestamps
5. Validate progress is between 0-100
6. Keep existing dependencies unless explicitly modified`;

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