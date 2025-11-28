import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useTaskStore } from '../../data/store/taskStore';

export default function OfflineBanner() {
  const { isOnline, pendingQueue } = useTaskStore();

  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Sin conexion • {pendingQueue.length} {pendingQueue.length === 1 ? 'acción pendiente' : 'acciones pendientes'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.offline,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    color: colors.surface,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
});