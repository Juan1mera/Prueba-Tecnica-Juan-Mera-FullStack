import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { format, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTaskStore } from '../../data/store/taskStore';
import { Task } from '../../data/store/types';
import { cancelNotificationForTask } from '../../core/utils/notifications';

type TaskItemProps = {
  task: Task;
  onEdit: (task: Task) => void;
};

export default function TaskItem({ task, onEdit }: TaskItemProps) {
  const { toggleTask, deleteTask } = useTaskStore();

  const handleToggle = async () => {
    await toggleTask(task.id);

    // Si se completó y tenía recordatorio → cancelar notificación
    if (!task.completed && task.reminderDate) {
      await cancelNotificationForTask(task.id);
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar tarea', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await cancelNotificationForTask(task.id);
          deleteTask(task.id);
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return `Hoy, ${format(date, 'HH:mm')}`;
    if (isPast(date) && !task.completed) return `Vencida: ${format(date, 'd MMM, HH:mm')}`;
    return format(date, 'd MMM, HH:mm', { locale: es });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkbox} onPress={handleToggle}>
        <View style={[styles.checkboxInner, task.completed && styles.checkboxCompleted]}>
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.content} onPress={() => onEdit(task)}>
        <Text style={[styles.title, task.completed && styles.titleCompleted]} numberOfLines={2}>
          {task.title}
        </Text>
        {task.content ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.content}
          </Text>
        ) : null}

        <View style={styles.dates}>
          {task.dueDate && (
            <Text style={[styles.dueDate, isPast(new Date(task.dueDate)) && !task.completed && styles.overdue]}>
              {formatDate(task.dueDate)}
            </Text>
          )}
          {task.reminderDate && (
            <Text style={styles.reminder}>Recordatorio: {format(new Date(task.reminderDate), 'HH:mm')}</Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(task)}>
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Borrar</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  checkbox: { marginRight: 12 },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  titleCompleted: { textDecorationLine: 'line-through', color: colors.textSecondary },
  description: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
  dates: { marginTop: 6, gap: 4 },
  dueDate: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  overdue: { color: colors.warning },
  reminder: { fontSize: 12, color: colors.secondary },
  actions: { flexDirection: 'row', gap: 8, marginLeft: 8 },
  actionBtn: {
    width: 56,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  deleteText: { fontSize: 13, color: colors.warning, fontWeight: '600' },
});