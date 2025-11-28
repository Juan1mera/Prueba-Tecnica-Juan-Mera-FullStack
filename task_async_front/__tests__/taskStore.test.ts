// __tests__/store/taskStore.test.ts
import { act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTaskStore } from '../src/store/taskStore';

// Mock del servicio ANTES de importar nada que lo use
jest.mock('../src/api/taskService', () => ({
  taskService: {
    createTask: jest.fn(),
    updateTask: jest.fn(),
    toggleTask: jest.fn(),
    deleteTask: jest.fn(),
    getTasks: jest.fn(),
    searchTasks: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { taskService } from '../src/api/taskService';

const mockTask = {
  id: '123',
  title: 'Comprar leche',
  content: 'Urgente',
  completed: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('taskStore - Comportamiento completo con modo offline', () => {
  const resetStore = () => {
    act(() => {
      useTaskStore.setState({
        tasks: [],
        pendingQueue: [],
        isOnline: true,
        loading: false,
        loadingMore: false,
        refreshing: false,
        error: null,
        currentPage: 0,
        totalPages: 0,
        hasMore: true,
        searchQuery: '',
      });
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    resetStore();
  });

  //=================================
  // Agrega tarea correctamente cuando está online
  //=================================
  it('agrega tarea correctamente cuando está online', async () => {
    (taskService.createTask as jest.Mock).mockResolvedValue(mockTask);

    await act(async () => {
      await useTaskStore.getState().addTask('Comprar leche', 'Urgente');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
    });

    const { tasks, pendingQueue } = useTaskStore.getState();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toEqual(mockTask);
    expect(pendingQueue).toHaveLength(0);
  });

  //=================================
  // Agrega tarea con UI optimista y la pone en cola cuando está offline
  //=================================
  it('agrega tarea con UI optimista y la pone en cola cuando está offline', async () => {
    act(() => useTaskStore.getState().setOnline(false));

    await act(async () => {
      await useTaskStore.getState().addTask('Tarea offline', 'Sin internet');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
    });

    const { tasks, pendingQueue } = useTaskStore.getState();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toMatch(/^temp_/);
    expect(tasks[0].title).toBe('Tarea offline');
    expect(tasks[0].content).toBe('Sin internet');
    expect(pendingQueue).toHaveLength(1);
    expect(pendingQueue[0].type).toBe('create_task');
  });

  //=================================
  // Sincroniza correctamente la cola al volver online
  //=================================
  it('sincroniza correctamente la cola al volver online', async () => {
    act(() => useTaskStore.getState().setOnline(false));

    await act(async () => {
      await useTaskStore.getState().addTask('Tarea 1', 'Contenido 1');
      await useTaskStore.getState().addTask('Tarea 2', 'Contenido 2');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
    });

    expect(useTaskStore.getState().pendingQueue).toHaveLength(2);

    (taskService.createTask as jest.Mock)
      .mockResolvedValueOnce({ ...mockTask, id: 'real-1', title: 'Tarea 1', content: 'Contenido 1' })
      .mockResolvedValueOnce({ ...mockTask, id: 'real-2', title: 'Tarea 2', content: 'Contenido 2' });

    (taskService.getTasks as jest.Mock).mockResolvedValue({
      content: [
        { ...mockTask, id: 'real-1', title: 'Tarea 1', content: 'Contenido 1' },
        { ...mockTask, id: 'real-2', title: 'Tarea 2', content: 'Contenido 2' }
      ],
      pageNumber: 0,
      totalPages: 1,
      last: true
    });

    await act(async () => {
      useTaskStore.getState().setOnline(true);
      await useTaskStore.getState().processQueue();
      await new Promise<void>(resolve => setTimeout(() => resolve(), 200));
    });

    const state = useTaskStore.getState();
    
    expect(state.pendingQueue).toHaveLength(0);
    expect(state.tasks).toHaveLength(2);
    expect(state.tasks.map(t => t.id)).toEqual(expect.arrayContaining(['real-1', 'real-2']));
    expect(state.tasks.some(t => t.id.startsWith('temp_'))).toBe(false);
  });

  //=================================
  // Mantiene acción en cola si falla al sincronizar
  //=================================
  it('mantiene acción en cola si falla al sincronizar', async () => {
    act(() => useTaskStore.getState().setOnline(false));
    
    await act(async () => {
      await useTaskStore.getState().addTask('Fallará', 'Contenido');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
    });

    expect(useTaskStore.getState().pendingQueue).toHaveLength(1);

    (taskService.createTask as jest.Mock).mockRejectedValue(new Error('Network'));

    await act(async () => {
      useTaskStore.getState().setOnline(true);
      await useTaskStore.getState().processQueue();
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
    });

    expect(useTaskStore.getState().pendingQueue).toHaveLength(1);
  });

  //=================================
  // Toggle de tarea funciona offline y se sincroniza después
  //=================================
  it('toggleTask funciona offline y se sincroniza después', async () => {
    (taskService.createTask as jest.Mock).mockResolvedValue(mockTask);
    
    await act(async () => {
      await useTaskStore.getState().addTask('Test', 'Contenido test');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
    });

    expect(useTaskStore.getState().tasks).toHaveLength(1);

    act(() => useTaskStore.getState().setOnline(false));

    await act(async () => {
      await useTaskStore.getState().toggleTask('123');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
    });

    expect(useTaskStore.getState().tasks[0].completed).toBe(true);
    expect(useTaskStore.getState().pendingQueue).toHaveLength(1);
    expect(useTaskStore.getState().pendingQueue[0].type).toBe('toggle_task');

    (taskService.toggleTask as jest.Mock).mockResolvedValue({});
    (taskService.getTasks as jest.Mock).mockResolvedValue({
      content: [{ ...mockTask, completed: true }],
      pageNumber: 0,
      totalPages: 1,
      last: true
    });

    await act(async () => {
      useTaskStore.getState().setOnline(true);
      await useTaskStore.getState().processQueue();
      await new Promise<void>(resolve => setTimeout(() => resolve(), 150));
    });

    expect(useTaskStore.getState().pendingQueue).toHaveLength(0);
  });

  //=================================
  // Delete de tarea revierte correctamente si falla
  //=================================
  it('deleteTask revierte correctamente si falla', async () => {
    (taskService.createTask as jest.Mock).mockResolvedValue(mockTask);
    
    await act(async () => {
      await useTaskStore.getState().addTask('Borrar', 'Contenido');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
    });

    expect(useTaskStore.getState().tasks).toHaveLength(1);
    const taskId = useTaskStore.getState().tasks[0].id;

    (taskService.deleteTask as jest.Mock).mockRejectedValue({ 
      response: { status: 500 },
      message: 'Error'
    });

    await act(async () => {
      await useTaskStore.getState().deleteTask(taskId);
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
    });

    const state = useTaskStore.getState();
    
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].id).toBe(taskId);
    expect(state.pendingQueue).toHaveLength(1);
    expect(state.pendingQueue[0].type).toBe('delete_task');
  });

  //=================================
  // Update de tarea funciona offline
  //=================================
  it('updateTask funciona offline', async () => {
    (taskService.createTask as jest.Mock).mockResolvedValue(mockTask);
    
    await act(async () => {
      await useTaskStore.getState().addTask('Original', 'Contenido original');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
    });

    expect(useTaskStore.getState().tasks).toHaveLength(1);

    act(() => useTaskStore.getState().setOnline(false));

    await act(async () => {
      await useTaskStore.getState().updateTask('123', 'Editado', 'Contenido editado');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
    });

    expect(useTaskStore.getState().tasks[0].title).toBe('Editado');
    expect(useTaskStore.getState().tasks[0].content).toBe('Contenido editado');
    expect(useTaskStore.getState().pendingQueue).toHaveLength(1);
    expect(useTaskStore.getState().pendingQueue[0].type).toBe('update_task');
  });

  //=================================
  // Fetch de tareas carga datos locales si no hay conexión
  //=================================
  it('fetchTasks carga datos locales si no hay conexión', async () => {
    act(() => {
      useTaskStore.setState({
        tasks: [mockTask],
        pendingQueue: [],
      });
    });

    (taskService.getTasks as jest.Mock).mockRejectedValue(new Error('Offline'));

    await act(async () => {
      await useTaskStore.getState().fetchTasks();
    });

    const state = useTaskStore.getState();
    
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].id).toBe('123');
    expect(state.error).toBe('Sin conexion. Mostrando tareas locales.');
  });
});