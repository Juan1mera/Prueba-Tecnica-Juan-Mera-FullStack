// src/components/TaskModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { useTaskStore } from '../store/taskStore';
import type { Task } from '../store/types';
import { CustomInput } from './ui/CustomInput';
import { CustomButton } from './ui/CustomButton';

type TaskModalProps = {
  visible: boolean;
  onClose: () => void;
  task?: Task | null;
};

export default function TaskModal({ visible, onClose, task }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { addTask, updateTask } = useTaskStore();

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setContent(task.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [task, visible]);

  const handleSave = () => {
    if (!title.trim()) return;

    if (isEditing && task) {
      updateTask(task.id, title.trim(), content.trim());
    } else {
      addTask(title.trim(), content.trim());
    }

    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>Título *</Text>
            <CustomInput
              value={title}
              onChangeText={setTitle}
              placeholder="Título de la tarea"
              autoFocus
            />

            <Text style={styles.label}>Descripción</Text>
            <CustomInput
              value={content}
              onChangeText={setContent}
              placeholder="Descripción (opcional)"
              multiline
            />
          </ScrollView>

          <View style={styles.footer}>
            <CustomButton title="Cancelar" variant="cancel" onPress={handleClose} />
            <CustomButton
              title={isEditing ? 'Guardar' : 'Crear'}
              variant="primary"
              disabled={!title.trim()}
              onPress={handleSave}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  content: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});