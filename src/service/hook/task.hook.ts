import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { taskService } from "@/service/function/task";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "@/types/task";

// Hook to fetch all tasks by project ID
export const useTasksByProjectId = (
  projectId: string,
): UseQueryResult<Task[], Error> => {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskService.getTasksByProjectId(projectId),
    enabled: !!projectId,
  });
};

// Hook to fetch task by ID
export const useTaskById = (id: string): UseQueryResult<Task, Error> => {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => taskService.getTaskById(id),
    enabled: !!id,
  });
};

// Hook to create task
export const useCreateTask = (
  projectId: string,
): UseMutationResult<Task, Error, CreateTaskRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
};

// Hook to update task
export const useUpdateTask = (
  projectId: string,
  taskId: string,
): UseMutationResult<Task, Error, UpdateTaskRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => taskService.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
};

// Hook to delete task
export const useDeleteTask = (
  projectId: string,
): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
};
