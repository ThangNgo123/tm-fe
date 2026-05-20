import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { projectService } from "@/service/function/project";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types/project";

// Hook to fetch all projects
export const useProjects = (): UseQueryResult<Project[], Error> => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.getAllProjects(),
  });
};

// Hook to fetch project by ID
export const useProjectById = (id: string): UseQueryResult<Project, Error> => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id,
  });
};

// Hook to create project
export const useCreateProject = (): UseMutationResult<
  Project,
  Error,
  CreateProjectRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

// Hook to update project
export const useUpdateProject = (
  id: string,
): UseMutationResult<Project, Error, UpdateProjectRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => projectService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
  });
};

// Hook to delete project
export const useDeleteProject = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
