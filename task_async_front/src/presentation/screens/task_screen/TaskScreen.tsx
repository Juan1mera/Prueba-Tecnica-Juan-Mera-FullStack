import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomInput } from '../../components/ui/CustomInput';
import { CustomButton } from '../../components/ui/CustomButton';
import { CustomDatePicker } from '../../components/ui/CustomDatePicker'; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTaskStore } from '../../../data/store/taskStore';
import { RootStackParamList, Task } from '../../../data/store/types';
import { cancelNotificationForTask, scheduleLocalNotification } from '../../../core/utils/notifications';
import { TaskScreenStyles } from './TaskScreenStyles';
import { fromLocalISOString, toLocalISOString } from '../../../core/utils/dateFormatter';

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
      setDueDate(task.dueDate ? fromLocalISOString(task.dueDate) : null);
      setReminderDate(task.reminderDate ? fromLocalISOString(task.reminderDate) : null);
    }
  }, [task]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      Alert.alert('Error', 'Título y descripción son obligatorios');
      return;
    }

    const dueIso = dueDate ? toLocalISOString(dueDate) : null;
    const reminderIso = reminderDate ? toLocalISOString(reminderDate) : null;

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
      <View style={TaskScreenStyles.container}>
        <View style={TaskScreenStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={TaskScreenStyles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={TaskScreenStyles.title}>{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</Text>
          {isEditing && (
            <TouchableOpacity onPress={handleDelete}>
              <Text style={TaskScreenStyles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={TaskScreenStyles.content} showsVerticalScrollIndicator={false}>
          <Text style={TaskScreenStyles.label}>Título *</Text>
          <CustomInput value={title} onChangeText={setTitle} placeholder="Título de la tarea" />

          <Text style={TaskScreenStyles.label}>Descripción *</Text>
          <CustomInput
            value={content}
            onChangeText={setContent}
            placeholder="¿Qué hay que hacer?"
            multiline
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <Text style={TaskScreenStyles.label}>Fecha límite</Text>
          <TouchableOpacity
            style={TaskScreenStyles.dateButton}
            onPress={() => setShowDuePicker(true)}
          >
            <Text style={dueDate ? TaskScreenStyles.dateText : TaskScreenStyles.placeholderText}>
              {dueDate ? formatDate(dueDate) : 'Opcional'}
            </Text>
          </TouchableOpacity>

          <Text style={TaskScreenStyles.label}>Recordatorio</Text>
          <TouchableOpacity
            style={TaskScreenStyles.dateButton}
            onPress={() => setShowReminderPicker(true)}
          >
            <Text style={reminderDate ? TaskScreenStyles.dateText : TaskScreenStyles.placeholderText}>
              {reminderDate ? formatDate(reminderDate) : 'Sin recordatorio'}
            </Text>
          </TouchableOpacity>

          {reminderDate && (
            <TouchableOpacity
              onPress={() => setReminderDate(null)}
              style={TaskScreenStyles.clearReminder}
            >
              <Text style={TaskScreenStyles.clearText}>Quitar recordatorio</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={TaskScreenStyles.footer}>
          <CustomButton title="Cancelar" variant="cancel" onPress={() => navigation.goBack()} />
          <CustomButton
            title={isEditing ? 'Guardar' : 'Crear'}
            variant="primary"
            onPress={handleSave}
            disabled={!title.trim() || !content.trim()}
          />
        </View>
      </View>

      <CustomDatePicker
        visible={showDuePicker}
        date={dueDate || new Date()}
        title="Fecha límite"
        onConfirm={(date) => {
          console.log("Fecha limite")
          console.log(date.getHours)
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
          console.log("Fecha limite")
          console.log(date.getHours)
          setReminderDate(date);
          setShowReminderPicker(false);
        }}
        onCancel={() => setShowReminderPicker(false)}
      />
    </KeyboardAvoidingView>
  );
}

