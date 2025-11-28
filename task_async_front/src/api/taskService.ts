import api from './client';
import type { Task, TaskPageResponse, SearchParams } from '../store/types';

export const taskService = {
  async getTasks(page = 0, size = 20): Promise<TaskPageResponse> {
    const response = await api.get('', {
      params: { page, size },
    });
    return response.data;
  },

  async searchTasks({ query, page = 0, size = 20 }: SearchParams): Promise<TaskPageResponse> {
    const response = await api.get('/search', {
      params: { query, page, size },
    });
    return response.data;
  },

  async createTask(title: string, content: string): Promise<Task> {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      throw new Error('El titulo es obligatorio');
    }

    if (!trimmedContent) {
      throw new Error('La descripcion es obligatoria');
    }

    const payload = {
      title: trimmedTitle,
      content: trimmedContent,
    };

    console.log('Creando tarea con payload:', JSON.stringify(payload, null, 2));

    const response = await api.post('', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('Tarea creada exitosamente:', response.data);
    return response.data;
  },

  async updateTask(id: string, title: string, content: string): Promise<Task> {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      throw new Error('El titulo es obligatorio');
    }

    if (!trimmedContent) {
      throw new Error('La descripcion es obligatoria');
    }

    const response = await api.put(`/${id}`, {
      title: trimmedTitle,
      content: trimmedContent,
    });
    
    return response.data;
  },

  async toggleTask(id: string): Promise<void> {
    await api.patch(`/${id}/toggle`);
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/${id}`);
  },
};