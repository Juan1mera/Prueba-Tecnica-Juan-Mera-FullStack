import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

type EmptyStateProps = {
  isSearching: boolean;
};

export default function EmptyState({ isSearching }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{isSearching ? '🔍' : '📝'}</Text>
      <Text style={styles.title}>
        {isSearching ? 'Sin resultados' : 'No hay tareas'}
      </Text>
      <Text style={styles.subtitle}>
        {isSearching
          ? 'Intenta con otra búsqueda'
          : '¡Crea tu primera tarea!'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});