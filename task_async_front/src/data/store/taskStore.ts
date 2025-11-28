import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { taskService } from '../api/taskService';
import type { Task, PendingAction, TaskPageResponse } from './types';
import { cancelNotificationForTask, scheduleLocalNotification } from '../../core/utils/notifications';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;
  isOnline: boolean;
  pendingQueue: PendingAction[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  searchQuery: string;

  // Actions
  fetchTasks: (refresh?: boolean) => Promise<void>;
  loadMoreTasks: () => Promise<void>;
  searchTasks: (query: string) => Promise<void>;
  addTask: (title: string, content?: string, dueDate?: string | null, reminderDate?: string | null) => Promise<Task>;
  updateTask: (id: string, title: string, content: string, dueDate?: string | null, reminderDate?: string | null) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setOnline: (online: boolean) => void;
  addToQueue: (action: PendingAction) => Promise<void>;
  processQueue: () => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      loadingMore: false,
      refreshing: false,
      error: null,
      isOnline: true,
      pendingQueue: [],
      currentPage: 0,
      totalPages: 0,
      hasMore: true,
      searchQuery: '',

      //=================================
      // Elimina el mensaje de error actual
      //=================================
      clearError: () => set({ error: null }),

      //=================================
      // Actualiza el estado de conexion (online/offline)
      //=================================
      setOnline: (online) => {
        set({ isOnline: online });
      },

      //=================================
      // Carga la primera página de tareas desde el servidor
      //=================================
      fetchTasks: async (refresh = false) => {
        if (refresh) {
          set({ refreshing: true, currentPage: 0, searchQuery: '' });
        } else {
          set({ loading: true });
        }

        set({ error: null });

        try {
          const response = await taskService.getTasks(0, 20);
          set({
            tasks: response.content,
            currentPage: response.pageNumber,
            totalPages: response.totalPages,
            hasMore: !response.last,
            loading: false,
            refreshing: false,
          });
        } catch {
          set({
            error: 'Sin conexion. Mostrando tareas locales.',
            loading: false,
            refreshing: false,
          });
        }
      },

      //=================================
      // Carga la siguiente página de tareas
      //=================================
      loadMoreTasks: async () => {
        const { hasMore, loadingMore, currentPage, searchQuery } = get();
        if (!hasMore || loadingMore) return;

        set({ loadingMore: true });

        try {
          const nextPage = currentPage + 1;
          let response: TaskPageResponse;

          if (searchQuery) {
            response = await taskService.searchTasks({ query: searchQuery, page: nextPage, size: 20 });
          } else {
            response = await taskService.getTasks(nextPage, 20);
          }

          set((state) => ({
            tasks: [...state.tasks, ...response.content],
            currentPage: response.pageNumber,
            totalPages: response.totalPages,
            hasMore: !response.last,
            loadingMore: false,
          }));
        } catch {
          set({ loadingMore: false });
        }
      },

      //=================================
      // Búsqueda de tareas
      //=================================
      searchTasks: async (query: string) => {
        set({ loading: true, error: null, searchQuery: query, currentPage: 0 });

        if (!query.trim()) {
          await get().fetchTasks();
          return;
        }

        try {
          const response = await taskService.searchTasks({ query, page: 0, size: 20 });
          set({
            tasks: response.content,
            currentPage: response.pageNumber,
            totalPages: response.totalPages,
            hasMore: !response.last,
            loading: false,
          });
        } catch {
          set({ error: 'Error al buscar tareas', loading: false });
        }
      },

      //=================================
      // Crea una nueva tarea → AHORA DEVUELVE LA TAREA
      //=================================
      addTask: async (title, content = '', dueDate?: string | null, reminderDate?: string | null): Promise<Task> => {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle) throw new Error('El título es obligatorio');
        if (!trimmedContent) throw new Error('La descripción es obligatoria');

        const tempId = `temp_${Date.now()}`;
        const tempTask: Task = {
          id: tempId,
          title: trimmedTitle,
          content: trimmedContent,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: dueDate ?? undefined,
          reminderDate: reminderDate ?? undefined,
        };

        set((state) => ({ tasks: [tempTask, ...state.tasks], error: null }));

        if (!get().isOnline) {
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'create_task',
            payload: { title: trimmedTitle, content: trimmedContent, tempId, dueDate, reminderDate },
          });
          return tempTask;
        }

        try {
          const newTask = await taskService.createTask(trimmedTitle, trimmedContent, dueDate, reminderDate);

          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === tempId ? newTask : t)),
          }));


          return newTask;
        } catch (error: any) {
          let errorMessage = 'Error al crear la tarea';
          if (error.response?.data?.detail) errorMessage = error.response.data.detail;
          else if (error.message) errorMessage = error.message;

          set({ error: errorMessage });
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== tempId) }));

          if (error.response?.status !== 400) {
            await get().addToQueue({
              id: Date.now().toString(),
              type: 'create_task',
              payload: { title: trimmedTitle, content: trimmedContent, tempId, dueDate, reminderDate },
            });
          }
          return tempTask;
        }
      },

      //=================================
      // Actualiza tarea → AHORA DEVUELVE LA TAREA ACTUALIZADA
      //=================================
      updateTask: async (id, title, content, dueDate?: string | null, reminderDate?: string | null): Promise<Task> => {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle) throw new Error('El título es obligatorio');
        if (!trimmedContent) throw new Error('La descripción es obligatoria');
        if (id.startsWith('temp_')) return get().tasks.find(t => t.id === id)!;

        const previousTask = get().tasks.find((t) => t.id === id);
        if (!previousTask) throw new Error('Tarea no encontrada');

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, title: trimmedTitle, content: trimmedContent, dueDate, reminderDate, updatedAt: new Date().toISOString() }
              : t
          ),
          error: null,
        }));

        if (!get().isOnline) {
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'update_task',
            payload: { id, title: trimmedTitle, content: trimmedContent, dueDate, reminderDate, previousTask },
          });
          return { ...previousTask, title: trimmedTitle, content: trimmedContent, dueDate, reminderDate };
        }

        try {
          const updatedTask = await taskService.updateTask(id, trimmedTitle, trimmedContent, dueDate, reminderDate);

          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
          }));


          return updatedTask;
        } catch (error: any) {
          let errorMessage = 'Error al actualizar la tarea';
          if (error.response?.data?.detail) errorMessage = error.response.data.detail;
          else if (error.message) errorMessage = error.message;

          set({ error: errorMessage });
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? previousTask : t)),
          }));

          if (error.response?.status !== 400 && error.response?.status !== 404) {
            await get().addToQueue({
              id: Date.now().toString(),
              type: 'update_task',
              payload: { id, title: trimmedTitle, content: trimmedContent, dueDate, reminderDate, previousTask },
            });
          }
          return previousTask;
        }
      },

      //=================================
      // Toggle completado
      //=================================
      toggleTask: async (id) => {
        if (id.startsWith('temp_')) return;

        const previousCompleted = get().tasks.find(t => t.id === id)?.completed ?? false;

        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        }));

        if (!get().isOnline) {
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'toggle_task',
            payload: { id, previousCompleted },
          });
          return;
        }

        try {
          await taskService.toggleTask(id);
          const task = get().tasks.find(t => t.id === id);
          if (task?.completed && task.reminderDate) {
            await cancelNotificationForTask(id);
          }
        } catch (error: any) {
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: previousCompleted } : t)),
          }));

          if (error.response?.status !== 404) {
            await get().addToQueue({
              id: Date.now().toString(),
              type: 'toggle_task',
              payload: { id, previousCompleted },
            });
          }
        }
      },

      //=================================
      // Eliminar tarea
      //=================================
      deleteTask: async (id) => {
        if (id.startsWith('temp_')) {
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
            pendingQueue: state.pendingQueue.filter(a => !(a.type === 'create_task' && a.payload.tempId === id)),
          }));
          await AsyncStorage.setItem('offline-queue', JSON.stringify(get().pendingQueue));
          return;
        }

        const previousTasks = get().tasks;
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));

        if (!get().isOnline) {
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'delete_task',
            payload: { id, previousTasks },
          });
          return;
        }

        try {
          await taskService.deleteTask(id);
          await cancelNotificationForTask(id);
        } catch (error: any) {
          if (error.response?.status !== 404) {
            set({ tasks: previousTasks });
            await get().addToQueue({
              id: Date.now().toString(),
              type: 'delete_task',
              payload: { id, previousTasks },
            });
          }
        }
      },

      //=================================
      // Cola offline
      //=================================
      addToQueue: async (action) => {
        set((state) => ({ pendingQueue: [...state.pendingQueue, action] }));
        await AsyncStorage.setItem('offline-queue', JSON.stringify(get().pendingQueue));
      },

      processQueue: async () => {
        const queue = [...get().pendingQueue];
        if (queue.length === 0) return;

        set({ loading: true });
        const remaining: PendingAction[] = [];
        const tempIdReplacements = new Map<string, Task>();

        for (const action of queue) {
          try {
            if (action.type === 'create_task') {
              const { title, content, dueDate, reminderDate } = action.payload;
              const newTask = await taskService.createTask(title, content, dueDate ?? null, reminderDate ?? null);
              if (action.payload.tempId) tempIdReplacements.set(action.payload.tempId, newTask);
              if (newTask.reminderDate) await scheduleLocalNotification(newTask);
            }
            else if (action.type === 'update_task') {
              if (!action.payload.id.startsWith('temp_')) {
                const task = await taskService.updateTask(
                  action.payload.id,
                  action.payload.title,
                  action.payload.content,
                  action.payload.dueDate ?? null,
                  action.payload.reminderDate ?? null
                );
                await cancelNotificationForTask(action.payload.id);
                if (task.reminderDate) await scheduleLocalNotification(task);
              }
            }
            else if (action.type === 'toggle_task') {
              if (!action.payload.id.startsWith('temp_')) {
                await taskService.toggleTask(action.payload.id);
                const task = get().tasks.find(t => t.id === action.payload.id);
                if (task?.completed && task.reminderDate) await cancelNotificationForTask(task.id);
              }
            }
            else if (action.type === 'delete_task') {
              if (!action.payload.id.startsWith('temp_')) {
                try {
                  await taskService.deleteTask(action.payload.id);
                  await cancelNotificationForTask(action.payload.id);
                } catch (e: any) {
                  if (e.response?.status === 404) await cancelNotificationForTask(action.payload.id);
                  else throw e;
                }
              }
            }
          } catch (error: any) {
            console.warn('Error procesando cola:', action.type, error.message);
            remaining.push(action);
            if (error.response?.status === 400) continue;
            break;
          }
        }

        if (tempIdReplacements.size > 0) {
          set((state) => ({
            tasks: state.tasks.map((t) => tempIdReplacements.get(t.id) || t),
          }));
        }

        set({ pendingQueue: remaining, loading: false });
        await AsyncStorage.setItem('offline-queue', JSON.stringify(remaining));

        if (remaining.length === 0 && get().isOnline) {
          await get().fetchTasks(true).catch(() => {});
        }
      },
    }),
    {
      name: 'tasksync-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        pendingQueue: state.pendingQueue,
      }),
    }
  )
);



// ============================================
// Notificaciones locales o push
// Usando notifee
// ============================================

// TODOS

// ============================================
// Camara
// seleccionar una imagen
// Enviar al backend o subirla directamente a un storage(firebase/supabase) y enviar la url
// ============================================


// ============================================
// GPS
// No le veo mucha utlididad pero es facil de implementar
// guardando datos como Latitude y Longitude
// Uso de google maps api(Maps SDK for iOS/Android, )
// usar Places API para seleccionar lugares en el mapa y convertirlos en lat y lng
// usar geocoding para convertir esas cords en una direccion
// ============================================


// ============================================
// Deep Link - Abrir una tarea con links externos
// TODO: Investigar como hacerlo
// chatgpt dice que se puede hacer facil con react navigation
// o usar expo, xd
// ============================================
