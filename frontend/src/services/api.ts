import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
  Scheme,
  CreateSchemeData,
  Project,
  CreateProjectData,
  Work,
  CreateWorkData,
  DashboardStats,
  ApiResponse,
  PaginatedResponse
} from '../types';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
  }
};

// Schemes API
export const schemesAPI = {
  getAll: async (): Promise<Scheme[]> => {
    const response = await api.get<Scheme[]>('/schemes');
    return response.data;
  },

  getById: async (id: string): Promise<Scheme> => {
    const response = await api.get<Scheme>(`/schemes/${id}`);
    return response.data;
  },

  create: async (data: CreateSchemeData): Promise<Scheme> => {
    const response = await api.post<Scheme>('/schemes', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateSchemeData>): Promise<Scheme> => {
    const response = await api.put<Scheme>(`/schemes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/schemes/${id}`);
  }
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  getByScheme: async (schemeId: string): Promise<Project[]> => {
    const response = await api.get<Project[]>(`/projects?schemeId=${schemeId}`);
    return response.data;
  },

  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateProjectData>): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  }
};

// Works API
export const worksAPI = {
  getAll: async (): Promise<Work[]> => {
    const response = await api.get<Work[]>('/works');
    return response.data;
  },

  getById: async (id: string): Promise<Work> => {
    const response = await api.get<Work>(`/works/${id}`);
    return response.data;
  },

  getByProject: async (projectId: string): Promise<Work[]> => {
    const response = await api.get<Work[]>(`/works?projectId=${projectId}`);
    return response.data;
  },

  getByScheme: async (schemeId: string): Promise<Work[]> => {
    const response = await api.get<Work[]>(`/works?schemeId=${schemeId}`);
    return response.data;
  },

  create: async (data: CreateWorkData): Promise<Work> => {
    const response = await api.post<Work>('/works', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateWorkData>): Promise<Work> => {
    const response = await api.put<Work>(`/works/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/works/${id}`);
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }
};

export default api;