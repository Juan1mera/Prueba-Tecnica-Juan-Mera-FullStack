import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useTaskStore } from '../store/taskStore';

export const useNetworkStatus = () => {
  const setOnline = useTaskStore((state) => state.setOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });

    return unsubscribe;
  }, [setOnline]);
};