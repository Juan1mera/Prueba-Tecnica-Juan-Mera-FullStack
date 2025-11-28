import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTaskStore } from '../../data/store/taskStore';

export default function ErrorBanner() {
  const error = useTaskStore((state) => state.error);
  const clearError = useTaskStore((state) => state.clearError);

  if (!error) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠</Text>
        <Text style={styles.text}>{error}</Text>
      </View>
      <TouchableOpacity onPress={clearError} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#991B1B',
    fontWeight: 'bold',
  },
});