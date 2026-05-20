import type { User } from "./user";
import type { Task } from "./task";

export interface Project {
  id: string;
  name: string;
  description?: string;
  user: Omit<User, "projects" | "refreshTokens">;
  tasks: Task[];
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}
