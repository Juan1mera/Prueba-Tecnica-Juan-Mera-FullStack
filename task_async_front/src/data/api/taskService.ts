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

  async createTask(
    title: string,
    content: string,
    dueDate?: string | null,
    reminderDate?: string | null
  ): Promise<Task> {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) throw new Error('El título es obligatorio');
    if (!trimmedContent) throw new Error('La descripción es obligatoria');

    const payload: any = {
      title: trimmedTitle,
      content: trimmedContent,
    };

    if (dueDate) payload.dueDate = dueDate;
    if (reminderDate) payload.reminderDate = reminderDate;

    const response = await api.post('', payload);
    return response.data;
  },

  async updateTask(
    id: string,
    title: string,
    content: string,
    dueDate?: string | null,
    reminderDate?: string | null
  ): Promise<Task> {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) throw new Error('El título es obligatorio');
    if (!trimmedContent) throw new Error('La descripción es obligatoria');

    const payload: any = {
      title: trimmedTitle,
      content: trimmedContent,
    };

    if (dueDate !== undefined) payload.dueDate = dueDate;
    if (reminderDate !== undefined) payload.reminderDate = reminderDate;

    const response = await api.put(`/${id}`, payload);
    return response.data;
  },

  async toggleTask(id: string): Promise<void> {
    await api.patch(`/${id}/toggle`);
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/${id}`);
  },
};