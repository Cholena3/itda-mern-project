// User and Authentication types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  department?: string;
  permissions?: Permissions;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  department?: string;
  permissions: Permissions;
  token: string;
  createdAt?: string;
  updatedAt?: string;
}

// RBAC permission types
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Resource = 'schemes' | 'projects' | 'works' | 'photos' | 'users' | 'dashboard' | 'monitoring' | 'ai' | 'search' | 'locations';
export type Permissions = Partial<Record<Resource, Action[]>>;

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'viewer';
  department?: string;
}

// Scheme types
export interface Scheme {
  _id: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchemeData {
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  status?: 'Planning' | 'Active' | 'Completed' | 'On Hold';
}

// Project types
export interface Project {
  _id: string;
  name: string;
  description: string;
  schemeId: string;
  schemeName?: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  district?: string;
  block?: string;
  gramPanchayat?: string;
  village?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
  schemeId: string;
  budget: number;
  startDate: string;
  endDate: string;
  status?: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  district?: string;
  block?: string;
  gramPanchayat?: string;
  village?: string;
}

// Work types
export interface Work {
  _id: string;
  name: string;
  description: string;
  projectId: string;
  projectName?: string;
  schemeId: string;
  schemeName?: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  progress: number;
  district?: string;
  block?: string;
  gramPanchayat?: string;
  village?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkData {
  name: string;
  description: string;
  projectId: string;
  schemeId: string;
  budget: number;
  startDate: string;
  endDate: string;
  status?: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  progress?: number;
  district?: string;
  block?: string;
  gramPanchayat?: string;
  village?: string;
}

// Dashboard types
export interface DashboardStats {
  totalSchemes: number;
  totalProjects: number;
  totalWorks: number;
  totalBudget: number;
  activeSchemes: number;
  activeProjects: number;
  activeWorks: number;
  completedWorks: number;
  recentActivity: ActivityItem[];
  schemeBudgets?: any[];
  workStatusDistribution?: any[];
  progressDistribution?: any[];
  budgetVsExpenditure?: { totalBudget: number; totalSpent: number };
  topSchemesByBudget?: any[];
  error?: string;
  partial?: boolean;
}

export interface ActivityItem {
  _id: string;
  type: 'scheme' | 'project' | 'work';
  action: 'created' | 'updated' | 'completed';
  name: string;
  date: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

// Status options
export const StatusOptions = [
  { value: 'Planning', label: 'Planning' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'On Hold', label: 'On Hold' }
] as const;