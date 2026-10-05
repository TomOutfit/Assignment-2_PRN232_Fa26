// Shared typed response shapes for the TaskTrack API.
// Based on the controllers/DTOs the user shipped.

export interface Department {
  departmentId: number;
  departmentName: string;
  departmentDescription: string;
  isActive: boolean;
  projects?: Project[];
}

export interface Project {
  projectId: number;
  projectName: string;
  description: string | null;
  startDate: string; // ISO date
  endDate: string | null;
  status: number; // 0..3
  departmentId: number;
  isActive: boolean;
  createdDate: string;
  departmentName?: string; // included on list endpoints
}

export interface TaskTag {
  taskId: number;
  tagId: number;
}

export interface Tag {
  tagId: number;
  tagName: string;
  color: string;
}

export interface Task {
  taskId: number;
  title: string;
  description: string | null;
  status: number; // 0..3
  priority: number; // 0..3
  dueDate: string | null;
  projectId: number;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
  tags?: Tag[];
  tagIds?: number[];
}

// ==================== DTOs ====================

export interface CreateDepartmentDto {
  departmentName: string;
  departmentDescription: string;
  isActive?: boolean;
}

export interface UpdateDepartmentDto {
  departmentName: string;
  departmentDescription: string;
  isActive?: boolean;
}

export interface CreateProjectDto {
  projectName: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: number;
  departmentId: number;
}

export interface UpdateProjectDto {
  projectName: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: number;
  departmentId: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  status: number;
  priority: number;
  dueDate?: string | null;
  projectId: number;
  tagIds?: number[];
}

export interface UpdateTaskDto {
  title: string;
  description?: string | null;
  status: number;
  priority: number;
  dueDate?: string | null;
  projectId: number;
  tagIds?: number[];
}

export interface CreateTagDto {
  tagName: string;
  color: string;
}

export interface UpdateTagDto {
  tagName: string;
  color: string;
}
