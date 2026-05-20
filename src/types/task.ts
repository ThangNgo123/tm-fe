export const TaskStatus = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: number;
  due_date_start?: string;
  due_date_end?: string;
  project: {
    id: string;
    name: string;
    user?: {
      id: string;
      email: string;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
  due_date_start?: string;
  due_date_end?: string;
  project_id: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
  due_date_start?: string;
  due_date_end?: string;
}
