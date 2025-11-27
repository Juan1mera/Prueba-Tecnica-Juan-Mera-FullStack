import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { useTaskStore } from '../store/taskStore';
import type { Task } from '../store/types';

type TaskItemProps = {
  task: Task;
  onEdit: (task: Task) => void;
};

export default function TaskItem({ task, onEdit }: TaskItemProps) {
  const { toggleTask, deleteTask } = useTaskStore();

  const handleDelete = () => {
    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteTask(task.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTask(task.id)}
      >
        <View
          style={[
            styles.checkboxInner,
            task.completed && styles.checkboxCompleted,
          ]}
        >
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.content} onPress={() => onEdit(task)}>
        <Text
          style={[styles.title, task.completed && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.content ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.content}
          </Text>
        ) : null}
        <Text style={styles.date}>
          {new Date(task.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(task)}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.completed,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionBtn: {
    width: 56,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: {
    fontSize: 16,
  },
  deleteText: {
    fontSize: 16,
  },
});