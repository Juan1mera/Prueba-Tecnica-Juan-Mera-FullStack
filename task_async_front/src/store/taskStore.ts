import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { taskService } from '../api/taskService';
import type { Task, PendingAction, TaskPageResponse } from './types';
import { cancelNotificationForTask, scheduleLocalNotification } from '../utils/notifications';

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
  addTask: (title: string, content?: string, dueDate?: string | null, reminderDate?: string | null) => Promise<void>;
  updateTask: (id: string, title: string, content: string, dueDate?: string | null, reminderDate?: string | null) => Promise<void>;
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
      addTask: async (title, content = '', dueDate?: string | null, reminderDate?: string | null) => {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle) {
          set({ error: 'El título no puede estar vacío' });
          return;
        }
        if (!trimmedContent) {
          set({ error: 'La descripción no puede estar vacía' });
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
          return;
        }

        try {
          const newTask = await taskService.createTask(trimmedTitle, trimmedContent, dueDate, reminderDate);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === tempId ? newTask : t)),
          }));
        } catch (error: any) {
          let errorMessage = 'Error al crear la tarea';
          if (error.response?.data?.detail) errorMessage = error.response.data.detail;
          else if (error.response?.data?.title) errorMessage = error.response.data.title;
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
        }
      },

      //=================================
      // Actualiza título y contenido de una tarea existente
      // Actualización optimista + cola offline
      //=================================
      updateTask: async (id, title, content, dueDate?: string | null, reminderDate?: string | null) => {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle) {
          set({ error: 'El título no puede estar vacío' });
          return;
        }
        if (!trimmedContent) {
          set({ error: 'La descripción no puede estar vacía' });
          return;
        }

        if (id.startsWith('temp_')) return;

        const previousTask = get().tasks.find((t) => t.id === id);

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
          return;
        }

        try {
          const updatedTask = await taskService.updateTask(id, trimmedTitle, trimmedContent, dueDate, reminderDate);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
          }));
        } catch (error: any) {
          let errorMessage = 'Error al actualizar la tarea';
          if (error.response?.data?.detail) errorMessage = error.response.data.detail;
          else if (error.message) errorMessage = error.message;

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
              payload: { id, title: trimmedTitle, content: trimmedContent, dueDate, reminderDate, previousTask },
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

        set({ loading: true });

        const remaining: PendingAction[] = [];
        const tempIdReplacements = new Map<string, Task>();

        for (const action of queue) {
          try {
            if (action.type === 'create_task') {
              const { title, content, dueDate, reminderDate } = action.payload;
              const newTask = await taskService.createTask(
                title,
                content,
                dueDate ?? null,
                reminderDate ?? null
              );

              if (action.payload.tempId) {
                tempIdReplacements.set(action.payload.tempId, newTask);
              }

              // Programar notificación local si tiene reminder
              if (newTask.reminderDate) {
                await scheduleLocalNotification(newTask);
              }
            } 
            else if (action.type === 'update_task') {
              if (!action.payload.id.startsWith('temp_')) {
                await taskService.updateTask(
                  action.payload.id,
                  action.payload.title,
                  action.payload.content,
                  action.payload.dueDate ?? null,
                  action.payload.reminderDate ?? null
                );

                // Volver a programar notificación si cambió
                const task = get().tasks.find(t => t.id === action.payload.id);
                if (task?.reminderDate) {
                  await cancelNotificationForTask(task.id);
                  await scheduleLocalNotification(task);
                }
              }
            } 
            else if (action.type === 'toggle_task') {
              if (!action.payload.id.startsWith('temp_')) {
                await taskService.toggleTask(action.payload.id);

                const task = get().tasks.find(t => t.id === action.payload.id);
                if (task?.completed && task.reminderDate) {
                  await cancelNotificationForTask(task.id);
                }
              }
            } 
            else if (action.type === 'delete_task') {
              if (!action.payload.id.startsWith('temp_')) {
                try {
                  await taskService.deleteTask(action.payload.id);
                  await cancelNotificationForTask(action.payload.id);
                } catch (error: any) {
                  if (error.response?.status === 404) {
                    // Ya estaba borrada, ok
                    await cancelNotificationForTask(action.payload.id);
                  } else {
                    throw error;
                  }
                }
              }
            }
          } catch (error: any) {
            console.warn('Error procesando acción en cola:', action.type, error.message);
            remaining.push(action);

            if (error.response?.status === 400) {
              console.log('Error 400: acción inválida, se descarta');
              continue;
            }
            break; // Detiene el procesamiento si hay error de red u otro grave
          }
        }

        // Reemplazar IDs temporales por reales
        if (tempIdReplacements.size > 0) {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              tempIdReplacements.has(t.id) ? tempIdReplacements.get(t.id)! : t
            ),
          }));
        }

        // Actualizar cola persistente
        set({ pendingQueue: remaining, loading: false });
        await AsyncStorage.setItem('offline-queue', JSON.stringify(remaining));

        // Si se sincronizó todo, recargar datos frescos del servidor
        if (remaining.length === 0 && get().isOnline) {
          try {
            await get().fetchTasks(true);
          } catch {
            console.warn('Error refrescando tareas tras sincronización');
          }
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
