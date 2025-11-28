// src/screens/TaskScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomInput } from '../components/ui/CustomInput';
import { CustomButton } from '../components/ui/CustomButton';
import { CustomDatePicker } from '../components/ui/CustomDatePicker'; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { colors } from '../theme/colors';
import { useTaskStore } from '../../data/store/taskStore';
import { RootStackParamList, Task } from '../../data/store/types';
import { cancelNotificationForTask, scheduleLocalNotification } from '../../core/utils/notifications';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TaskScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const taskId = route.params?.taskId;

  const { tasks, addTask, updateTask, deleteTask } = useTaskStore();
  const task = tasks.find((t: Task) => t.id === taskId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);

  const [showDuePicker, setShowDuePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setContent(task.content || '');
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setReminderDate(task.reminderDate ? new Date(task.reminderDate) : null);
    }
  }, [task]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      Alert.alert('Error', 'Título y descripción son obligatorios');
      return;
    }

    const dueIso = dueDate?.toISOString() || null;
    const reminderIso = reminderDate?.toISOString() || null;

    if (isEditing && task) {
      await updateTask(task.id, trimmedTitle, trimmedContent, dueIso, reminderIso);

      await cancelNotificationForTask(task.id);
      if (reminderIso) {
        await scheduleLocalNotification({
          ...task,
          title: trimmedTitle,
          content: trimmedContent,
          dueDate: dueIso,
          reminderDate: reminderIso,
        });
      }
    } else {
      const newTask = await addTask(trimmedTitle, trimmedContent, dueIso, reminderIso);
      if (reminderIso && newTask) {
        await scheduleLocalNotification(newTask);
      }
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (task) {
              await deleteTask(task.id);
              await cancelNotificationForTask(task.id);
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return format(date, "d 'de' MMMM, HH:mm", { locale: es });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</Text>
          {isEditing && (
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Título *</Text>
          <CustomInput value={title} onChangeText={setTitle} placeholder="Título de la tarea" />

          <Text style={styles.label}>Descripción *</Text>
          <CustomInput
            value={content}
            onChangeText={setContent}
            placeholder="¿Qué hay que hacer?"
            multiline
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <Text style={styles.label}>Fecha límite</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDuePicker(true)}
          >
            <Text style={dueDate ? styles.dateText : styles.placeholderText}>
              {dueDate ? formatDate(dueDate) : 'Opcional'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Recordatorio</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowReminderPicker(true)}
          >
            <Text style={reminderDate ? styles.dateText : styles.placeholderText}>
              {reminderDate ? formatDate(reminderDate) : 'Sin recordatorio'}
            </Text>
          </TouchableOpacity>

          {reminderDate && (
            <TouchableOpacity
              onPress={() => setReminderDate(null)}
              style={styles.clearReminder}
            >
              <Text style={styles.clearText}>Quitar recordatorio</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton title="Cancelar" variant="cancel" onPress={() => navigation.goBack()} />
          <CustomButton
            title={isEditing ? 'Guardar' : 'Crear'}
            variant="primary"
            onPress={handleSave}
            disabled={!title.trim() || !content.trim()}
          />
        </View>
      </View>

      {/* NUEVOS PICKERS - 100% estables */}
      <CustomDatePicker
        visible={showDuePicker}
        date={dueDate || new Date()}
        title="Fecha límite"
        onConfirm={(date) => {
          setDueDate(date);
          setShowDuePicker(false);
        }}
        onCancel={() => setShowDuePicker(false)}
      />

      <CustomDatePicker
        visible={showReminderPicker}
        date={reminderDate || new Date()}
        minimumDate={new Date()}
        title="Recordatorio"
        onConfirm={(date) => {
          setReminderDate(date);
          setShowReminderPicker(false);
        }}
        onCancel={() => setShowReminderPicker(false)}
      />
    </KeyboardAvoidingView>
  );
}

// (Los styles se mantienen exactamente iguales que tenías antes)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    fontSize: 32,
    color: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  deleteText: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  dateButton: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: { color: colors.text, fontSize: 15 },
  placeholderText: { color: colors.textSecondary, fontSize: 15 },
  clearReminder: { marginTop: 8 },
  clearText: { color: colors.warning, fontSize: 14, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});