import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { taskService } from '../api/taskService';
import type { Task, PendingAction, TaskPageResponse } from './types';

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
  addTask: (title: string, content?: string) => Promise<void>;
  updateTask: (id: string, title: string, content: string) => Promise<void>;
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

      clearError: () => set({ error: null }),

      setOnline: (online) => {
        set({ isOnline: online });
        if (online) {
          console.log('Conexión detectada → Sincronizando cola offline...');
          get().processQueue();
        }
      },

      fetchTasks: async (refresh = false) => {
        if (refresh) {
          set({ refreshing: true, currentPage: 0, searchQuery: '' });
        } else {
          set({ loading: true });
        }

        set({ error: null });

        try {
          const response = await taskService.getTasks(0, 20);
          console.log('Tareas cargadas desde API:', response.content.length);

          set({
            tasks: response.content,
            currentPage: response.pageNumber,
            totalPages: response.totalPages,
            hasMore: !response.last,
            loading: false,
            refreshing: false,
          });
        } catch {
          console.warn('Falló fetchTasks → usando datos locales (offline)');
          set({
            error: 'Sin conexión. Mostrando tareas locales.',
            loading: false,
            refreshing: false,
          });
        }
      },

      loadMoreTasks: async () => {
        const { hasMore, loadingMore, currentPage, searchQuery } = get();

        if (!hasMore || loadingMore) return;

        set({ loadingMore: true });

        try {
          const nextPage = currentPage + 1;
          let response: TaskPageResponse;

          if (searchQuery) {
            response = await taskService.searchTasks({
              query: searchQuery,
              page: nextPage,
              size: 20,
            });
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
          console.error('Error cargando más tareas');
          set({ loadingMore: false });
        }
      },

      searchTasks: async (query: string) => {
        set({ loading: true, error: null, searchQuery: query, currentPage: 0 });

        if (!query.trim()) {
          await get().fetchTasks();
          return;
        }

        try {
          const response = await taskService.searchTasks({ query, page: 0, size: 20 });
          console.log('Búsqueda completada:', response.content.length, 'resultados');

          set({
            tasks: response.content,
            currentPage: response.pageNumber,
            totalPages: response.totalPages,
            hasMore: !response.last,
            loading: false,
          });
        } catch {
          console.error('Error en búsqueda');
          set({
            error: 'Error al buscar tareas',
            loading: false,
          });
        }
      },

      addTask: async (title, content = '') => {
        const tempId = `temp_${Date.now()}`;
        const tempTask: Task = {
          id: tempId,
          title,
          content,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Optimistic UI
        set((state) => ({ tasks: [tempTask, ...state.tasks] }));
        console.log('Tarea agregada localmente (optimistic)', { title });

        if (!get().isOnline) {
          console.log('Offline → tarea en cola');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'create_task',
            payload: { title, content },
          });
          return;
        }

        try {
          const newTask = await taskService.createTask(title, content);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === tempId ? newTask : t)),
          }));
          console.log('Tarea creada en servidor →', newTask.id);
        } catch {
          console.warn('Falló crear tarea → se guardó en cola offline');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'create_task',
            payload: { title, content },
          });
        }
      },

      updateTask: async (id, title, content) => {
        // Optimistic UI
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, title, content, updatedAt: new Date().toISOString() } : t
          ),
        }));
        console.log('Tarea actualizada localmente →', id);

        if (!get().isOnline) {
          console.log('Offline → update en cola');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'update_task',
            payload: { id, title, content },
          });
          return;
        }

        try {
          const updatedTask = await taskService.updateTask(id, title, content);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
          }));
          console.log('Tarea actualizada en servidor →', id);
        } catch {
          console.warn('Falló actualizar → se guardó en cola');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'update_task',
            payload: { id, title, content },
          });
        }
      },

      toggleTask: async (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
        console.log('Tarea toggled localmente →', id);

        if (!get().isOnline) {
          console.log('Offline → toggle en cola');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'toggle_task',
            payload: { id },
          });
          return;
        }

        try {
          await taskService.toggleTask(id);
          console.log('Tarea toggled en servidor →', id);
        } catch {
          console.warn('Falló toggle → se guardó en cola');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'toggle_task',
            payload: { id },
          });
        }
      },

      deleteTask: async (id) => {
        const previousTasks = get().tasks;

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
        console.log('Tarea eliminada localmente →', id);

        if (!get().isOnline) {
          console.log('Offline → delete en cola');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'delete_task',
            payload: { id },
          });
          return;
        }

        try {
          await taskService.deleteTask(id);
          console.log('Tarea eliminada en servidor →', id);
        } catch {
          console.warn('Falló delete → se guardó en cola');
          // Revertir en caso de error
          set({ tasks: previousTasks });
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'delete_task',
            payload: { id },
          });
        }
      },

      addToQueue: async (action) => {
        set((state) => ({ pendingQueue: [...state.pendingQueue, action] }));
        await AsyncStorage.setItem('offline-queue', JSON.stringify(get().pendingQueue));
        console.log('Acción agregada a cola offline:', action.type);
      },

      processQueue: async () => {
        const queue = [...get().pendingQueue];
        if (queue.length === 0) return;

        console.log(`Sincronizando ${queue.length} acciones pendientes...`);
        set({ loading: true });

        const remaining: PendingAction[] = [];

        for (const action of queue) {
          try {
            if (action.type === 'create_task') {
              await taskService.createTask(action.payload.title, action.payload.content);
              console.log('Sincronizado → create_task:', action.payload.title);
            } else if (action.type === 'update_task') {
              await taskService.updateTask(
                action.payload.id,
                action.payload.title,
                action.payload.content
              );
              console.log('Sincronizado → update_task:', action.payload.id);
            } else if (action.type === 'toggle_task') {
              await taskService.toggleTask(action.payload.id);
              console.log('Sincronizado → toggle_task:', action.payload.id);
            } else if (action.type === 'delete_task') {
              await taskService.deleteTask(action.payload.id);
              console.log('Sincronizado → delete_task:', action.payload.id);
            }
          } catch {
            console.warn('Falló sincronizar acción → queda en cola:', action.type);
            remaining.push(action);
            break;
          }
        }

        set({ pendingQueue: remaining, loading: false });
        await AsyncStorage.setItem('offline-queue', JSON.stringify(remaining));
        await get().fetchTasks();
        console.log(`Sincronización terminada. Pendientes: ${remaining.length}`);
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