import { apiUtils } from "@/utils/api";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types/project";

const PREFIX = "api/v1";

export const projectService = {
  // Get all projects for current user
  getAllProjects: async (): Promise<Project[]> => {
    const response = await apiUtils.get<Project[]>(`${PREFIX}/projects`);
    return response ?? [];
  },

  // Get project by ID
  getProjectById: async (id: string): Promise<Project> => {
    const response = await apiUtils.get<Project>(`${PREFIX}/projects/${id}`);
    return response;
  },

  // Create a new project
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await apiUtils.post<Project>(`${PREFIX}/projects`, data);
    return response;
  },

  // Update project
  updateProject: async (
    id: string,
    data: UpdateProjectRequest,
  ): Promise<Project> => {
    const response = await apiUtils.patch<Project>(
      `${PREFIX}/projects/${id}`,
      data,
    );
    return response;
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    return await apiUtils.delete<void>(`${PREFIX}/projects/${id}`);
  },
};
