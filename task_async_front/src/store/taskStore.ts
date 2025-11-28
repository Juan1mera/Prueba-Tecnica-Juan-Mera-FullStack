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

      //=================================
      // Elimina el mensaje de error actual
      //=================================
      clearError: () => set({ error: null }),

      //=================================
      // Actualiza el estado de conexión (online/offline)
      //=================================
      setOnline: (online) => {
        set({ isOnline: online });
      },

      //=================================
      // Carga la primera página de tareas desde el servidor
      // Si refresh = true reinicia la lista completa
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
          // console.log('Tareas cargadas desde API:', response.content.length);

          set({
            tasks: response.content,
            currentPage: response.pageNumber,
            totalPages: response.totalPages,
            hasMore: !response.last,
            loading: false,
            refreshing: false,
          });
        } catch {
          // console.warn('Fallo fetchTasks - usando datos locales (offline)');
          set({
            error: 'Sin conexion. Mostrando tareas locales.',
            loading: false,
            refreshing: false,
          });
        }
      },

      //=================================
      // Carga la siguiente página de tareas (paginación infinita)
      // Respeta búsqueda si la hay
      //=================================
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
          // console.error('Error cargando mas tareas');
          set({ loadingMore: false });
        }
      },

      //=================================
      // Realiza una búsqueda de tareas o recarga todas si la query está vacía
      // No funciona aun en modo offline
      //=================================
      searchTasks: async (query: string) => {
        set({ loading: true, error: null, searchQuery: query, currentPage: 0 });

        if (!query.trim()) {
          await get().fetchTasks();
          return;
        }

        try {
          const response = await taskService.searchTasks({ query, page: 0, size: 20 });
          // console.log('Busqueda completada:', response.content.length, 'resultados');

          set({
            tasks: response.content,
            currentPage: response.pageNumber,
            totalPages: response.totalPages,
            hasMore: !response.last,
            loading: false,
          });
        } catch {
          // console.error('Error en busqueda');
          set({
            error: 'Error al buscar tareas',
            loading: false,
          });
        }
      },

      //=================================
      // Crea una nueva tarea con actualización
      // Si está offline, la guarda en cola para sincronizar después
      //=================================
      addTask: async (title, content = '') => {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle) {
          set({ error: 'El titulo no puede estar vacio' });
          return;
        }

        if (!trimmedContent) {
          set({ error: 'La descripcion no puede estar vacia' });
          return;
        }

        const tempId = `temp_${Date.now()}`;
        const tempTask: Task = {
          id: tempId,
          title: trimmedTitle,
          content: trimmedContent,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ tasks: [tempTask, ...state.tasks], error: null }));
        // console.log('Tarea agregada localmente (optimistic)', { title: trimmedTitle, isOnline: get().isOnline });

        if (!get().isOnline) {
          // console.log('Offline - tarea en cola');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'create_task',
            payload: { title: trimmedTitle, content: trimmedContent, tempId },
          });
          return;
        }

        try {
          const newTask = await taskService.createTask(trimmedTitle, trimmedContent);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === tempId ? newTask : t)),
          }));
          // console.log('Tarea creada en servidor ->', newTask.id);
        } catch (error: any) {
          // console.error('Error creando tarea:', error);
          
          let errorMessage = 'Error al crear la tarea';
          if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response?.data?.title) {
            errorMessage = error.response.data.title;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ error: errorMessage });
          
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== tempId),
          }));
          
          if (error.response?.status !== 400) {
            await get().addToQueue({
              id: Date.now().toString(),
              type: 'create_task',
              payload: { title: trimmedTitle, content: trimmedContent, tempId },
            });
          }
        }
      },

      //=================================
      // Actualiza título y contenido de una tarea existente
      // Actualización optimista + cola offline
      //=================================
      updateTask: async (id, title, content) => {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle) {
          set({ error: 'El titulo no puede estar vacio' });
          return;
        }

        if (!trimmedContent) {
          set({ error: 'La descripcion no puede estar vacia' });
          return;
        }

        if (id.startsWith('temp_')) {
          // console.warn('No se puede actualizar una tarea temporal');
          return;
        }

        const previousTask = get().tasks.find(t => t.id === id);
        
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, title: trimmedTitle, content: trimmedContent, updatedAt: new Date().toISOString() } : t
          ),
          error: null,
        }));
        // console.log('Tarea actualizada localmente ->', id);

        if (!get().isOnline) {
          // console.log('Offline - update en cola');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'update_task',
            payload: { id, title: trimmedTitle, content: trimmedContent, previousTask },
          });
          return;
        }

        try {
          const updatedTask = await taskService.updateTask(id, trimmedTitle, trimmedContent);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
          }));
          // console.log('Tarea actualizada en servidor ->', id);
        } catch (error: any) {
          // console.error('Error actualizando tarea:', error);
          
          let errorMessage = 'Error al actualizar la tarea';
          if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ error: errorMessage });
          
          if (previousTask) {
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === id ? previousTask : t)),
            }));
          }
          
          if (error.response?.status !== 400 && error.response?.status !== 404) {
            await get().addToQueue({
              id: Date.now().toString(),
              type: 'update_task',
              payload: { id, title: trimmedTitle, content: trimmedContent, previousTask },
            });
          }
        }
      },

      //=================================
      // Cambia el estado completado de una tarea
      // Actualización y cola offline
      //=================================
      toggleTask: async (id) => {
        if (id.startsWith('temp_')) {
          // console.warn('No se puede marcar como completada una tarea temporal');
          return;
        }

        const previousCompleted = get().tasks.find(t => t.id === id)?.completed;
        
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
        // console.log('Tarea toggled localmente ->', id, '| isOnline:', get().isOnline);

        if (!get().isOnline) {
          // console.log('Offline - toggle en cola');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'toggle_task',
            payload: { id, previousCompleted },
          });
          return;
        }

        try {
          await taskService.toggleTask(id);
          // console.log('Tarea toggled en servidor ->', id);
        } catch (error: any) {
          // console.warn('Fallo toggle - revertiendo');
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, completed: previousCompleted ?? false } : t
            ),
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
      // Elimina una tarea (local y remotamente)
      // Maneja tareas temporales y cola offline
      //=================================
      deleteTask: async (id) => {
        if (id.startsWith('temp_')) {
          // console.log('Eliminando tarea temporal solo localmente ->', id);
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
          }));
          
          set((state) => ({
            pendingQueue: state.pendingQueue.filter(
              action => !(action.type === 'create_task' && action.payload.tempId === id)
            )
          }));
          await AsyncStorage.setItem('offline-queue', JSON.stringify(get().pendingQueue));
          return;
        }

        const previousTasks = get().tasks;

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
        // console.log('Tarea eliminada localmente ->', id);

        if (!get().isOnline) {
          // console.log('Offline - delete en cola');
          await get().addToQueue({
            id: Date.now().toString(),
            type: 'delete_task',
            payload: { id, previousTasks },
          });
          return;
        }

        try {
          await taskService.deleteTask(id);
          // console.log('Tarea eliminada en servidor ->', id);
        } catch (error: any) {
          // console.warn('Fallo delete - revertiendo');
          
          if (error.response?.status === 404) {
            // console.log('Tarea ya no existe en servidor - operacion completada');
          } else {
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
      // Añade una acción pendiente a la cola offline y la persiste
      //=================================
      addToQueue: async (action) => {
        set((state) => ({ pendingQueue: [...state.pendingQueue, action] }));
        await AsyncStorage.setItem('offline-queue', JSON.stringify(get().pendingQueue));
        // console.log('Accion agregada a cola offline:', action.type);
      },

      //=================================
      // Procesa todas las acciones pendientes cuando vuelve la conexión
      // Reemplaza IDs temporales y recarga datos del servidor al final
      //=================================
      processQueue: async () => {
        const queue = [...get().pendingQueue];
        if (queue.length === 0) return;

        // console.log(`Sincronizando ${queue.length} acciones pendientes...`);
        set({ loading: true });

        const remaining: PendingAction[] = [];
        const tempIdReplacements = new Map<string, Task>();
        // let successCount = 0;

        for (const action of queue) {
          try {
            if (action.type === 'create_task') {
              const newTask = await taskService.createTask(
                action.payload.title, 
                action.payload.content
              );
              // console.log('Sincronizado -> create_task:', action.payload.title, '| tempId:', action.payload.tempId, '-> realId:', newTask.id);
              
              if (action.payload.tempId) {
                tempIdReplacements.set(action.payload.tempId, newTask);
              }
              // successCount++;
            } else if (action.type === 'update_task') {
              if (!action.payload.id.startsWith('temp_')) {
                await taskService.updateTask(
                  action.payload.id,
                  action.payload.title,
                  action.payload.content
                );
                // console.log('Sincronizado -> update_task:', action.payload.id);
                // successCount++;
              } else {
                // console.warn('Omitiendo update de tarea temporal:', action.payload.id);
              }
            } else if (action.type === 'toggle_task') {
              if (!action.payload.id.startsWith('temp_')) {
                await taskService.toggleTask(action.payload.id);
                // console.log('Sincronizado -> toggle_task:', action.payload.id);
                // successCount++;
              } else {
                // console.warn('Omitiendo toggle de tarea temporal:', action.payload.id);
              }
            } else if (action.type === 'delete_task') {
              if (!action.payload.id.startsWith('temp_')) {
                try {
                  await taskService.deleteTask(action.payload.id);
                  // console.log('Sincronizado -> delete_task:', action.payload.id);
                  // successCount++;
                } catch (error: any) {
                  if (error.response?.status === 404) {
                    // console.log('Tarea ya eliminada en servidor:', action.payload.id, '- continuando');
                    // successCount++;
                  } else {
                    throw error;
                  }
                }
              } else {
                // console.warn('Omitiendo delete de tarea temporal:', action.payload.id);
              }
            }
          } catch (error: any) {
            // console.warn('Fallo sincronizar accion -> queda en cola:', action.type, error.message);
            remaining.push(action);
            
            if (error.response?.status === 400) {
              // console.log('Error de validacion - omitiendo esta accion');
              continue;
            }
            
            break;
          }
        }

        if (tempIdReplacements.size > 0) {
          set((state) => {
            // console.log('Reemplazando IDs temporales:', {
            //   before: state.tasks.map(t => ({ id: t.id, title: t.title })),
            //   replacements: Array.from(tempIdReplacements.entries()).map(([tempId, task]) => ({ tempId, realId: task.id }))
            // });
            
            return {
              tasks: state.tasks.map((t) => 
                tempIdReplacements.has(t.id) ? tempIdReplacements.get(t.id)! : t
              )
            };
          });
          
          // console.log('Despues del reemplazo:', get().tasks.map(t => ({ id: t.id, title: t.title })));
        }

        set({ pendingQueue: remaining, loading: false });
        await AsyncStorage.setItem('offline-queue', JSON.stringify(remaining));
        
        if (remaining.length === 0 && get().isOnline) {
          try {
            await get().fetchTasks();
            // console.log('Sincronizacion completa - datos actualizados desde servidor');
          } catch {
            // console.warn('fetchTasks fallo despues de sincronizar, pero los datos locales estan actualizados');
          }
        }
        
        // console.log(`Sincronizacion terminada. Exitosas: ${successCount}, Pendientes: ${remaining.length}`);
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