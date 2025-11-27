import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { useTaskStore } from '../store/taskStore';

const api = axios.create({
  baseURL: 'http://192.168.1.55:3000/api/tasks',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// Escuchar conexión
NetInfo.addEventListener((state) => {
  const isConnected = !!state.isConnected;
  useTaskStore.getState().setOnline(isConnected);
  
  if (isConnected) {
    console.log('🟢 Conexión restaurada → Sincronizando...');
    useTaskStore.getState().processQueue();
  }
});

export default api;