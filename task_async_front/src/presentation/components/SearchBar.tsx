import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { useTaskStore } from '../../data/store/taskStore';

export default function SearchBar() {
  const [localQuery, setLocalQuery] = useState('');
  const { searchTasks, fetchTasks, loading, searchQuery } = useTaskStore();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        searchTasks(localQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, searchTasks]);

  const handleClear = () => {
    setLocalQuery('');
    fetchTasks();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Buscar tareas..."
          placeholderTextColor={colors.textSecondary}
          value={localQuery}
          onChangeText={setLocalQuery}
        />
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
        {localQuery.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <View style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.surface,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 8,
  },
  clearIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.textSecondary,
  },
});