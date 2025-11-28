import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useTaskStore } from '../../data/store/taskStore';

export const useNetworkStatus = () => {
  const setOnline = useTaskStore((state) => state.setOnline);
  const processQueue = useTaskStore((state) => state.processQueue);
  const wasOfflineRef = useRef(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Verificar estado inicial de conectividad
    NetInfo.fetch().then((state) => {
      const isConnected = !!state.isConnected;
      console.log('Estado inicial de red:', isConnected ? 'ONLINE' : 'OFFLINE');
      setOnline(isConnected);
      wasOfflineRef.current = !isConnected;
      isInitializedRef.current = true;
    });

    // Escuchar cambios de conectividad
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!isInitializedRef.current) return;

      const isConnected = !!state.isConnected;
      const wasOffline = wasOfflineRef.current;

      console.log('Cambio de red detectado:', isConnected ? 'ONLINE' : 'OFFLINE');
      setOnline(isConnected);

      if (isConnected && wasOffline) {
        console.log('Conexion restaurada - Sincronizando cola...');
        setTimeout(() => {
          processQueue();
        }, 500);
      }

      wasOfflineRef.current = !isConnected;
    });

    return unsubscribe;
  }, [setOnline, processQueue]);
};