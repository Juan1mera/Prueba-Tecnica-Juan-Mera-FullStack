export type Task = {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  
  dueDate?: string | null;        
  reminderDate?: string | null;   
};

export type TaskPageResponse = {
  content: Task[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

// Tipos extendidos para soportar rollback y sincronización
export type PendingAction =
  | {
      id: string;
      type: 'create_task';
      payload: {
        title: string;
        content: string;
        completed?: boolean;
        tempId?: string;
        dueDate?: string | null;
        reminderDate?: string | null;
      };
    }
  | {
      id: string;
      type: 'update_task';
      payload: {
        id: string;
        title: string;
        content: string;
        dueDate?: string | null;
        reminderDate?: string | null;
        previousTask?: Task;
      };
    }
  | { 
      id: string; 
      type: 'toggle_task'; 
      payload: { 
        id: string;
        previousCompleted?: boolean; 
      } 
    }
  | { 
      id: string; 
      type: 'delete_task'; 
      payload: { 
        id: string;
        previousTasks?: Task[]; 
      } 
    };

export type SearchParams = {
  query: string;
  page?: number;
  size?: number;
};

export type RootStackParamList = {
  Home: undefined;
  Task: { taskId?: string } | undefined; 
};