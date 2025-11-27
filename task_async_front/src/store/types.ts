export type Task = {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskPageResponse = {
  content: Task[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type PendingAction =
  | { id: string; type: 'create_task'; payload: { title: string; content: string } }
  | { id: string; type: 'update_task'; payload: { id: string; title: string; content: string } }
  | { id: string; type: 'toggle_task'; payload: { id: string } }
  | { id: string; type: 'delete_task'; payload: { id: string } };

export type SearchParams = {
  query: string;
  page?: number;
  size?: number;
};