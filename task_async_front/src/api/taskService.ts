import api from './client';
import type { Task, TaskPageResponse, SearchParams } from '../store/types';

export const taskService = {
  // Obtener tareas con paginación
  getTasks: async (page = 0, size = 20): Promise<TaskPageResponse> => {
    const response = await api.get<TaskPageResponse>('', {
      params: { page, size },
    });
    return response.data;
  },

  // Buscar tareas
  searchTasks: async ({ query, page = 0, size = 20 }: SearchParams): Promise<TaskPageResponse> => {
    const response = await api.get<TaskPageResponse>('/search', {
      params: { q: query, page, size },
    });
    return response.data;
  },

  // Crear tarea
  createTask: async (title: string, content: string): Promise<Task> => {
    const response = await api.post<Task>('', { title, content });
    return response.data;
  },

  // Actualizar tarea
  updateTask: async (id: string, title: string, content: string): Promise<Task> => {
    const response = await api.put<Task>(`/${id}`, { title, content });
    return response.data;
  },

  // Toggle completado
  toggleTask: async (id: string): Promise<Task> => {
    const response = await api.patch<Task>(`/${id}/toggle`);
    return response.data;
  },

  // Eliminar tarea
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/${id}`);
  },
};