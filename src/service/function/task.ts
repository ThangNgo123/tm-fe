import { apiUtils } from "@/utils/api";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "@/types/task";

const PREFIX = "api/v1";

export const taskService = {
  // Get all tasks in a project
  getTasksByProjectId: async (projectId: string): Promise<Task[]> => {
    const response = await apiUtils.get<Task[]>(
      `${PREFIX}/tasks?project_id=${projectId}`,
    );
    return response ?? [];
  },

  // Get task by ID
  getTaskById: async (id: string): Promise<Task> => {
    const response = await apiUtils.get<Task>(`${PREFIX}/tasks/${id}`);
    return response;
  },

  // Create a new task
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiUtils.post<Task>(`${PREFIX}/tasks`, data);
    return response;
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiUtils.patch<Task>(`${PREFIX}/tasks/${id}`, data);
    return response;
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    await apiUtils.del(`${PREFIX}/tasks/${id}`);
  },
};
