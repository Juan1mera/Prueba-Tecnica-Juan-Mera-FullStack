import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';
import { Platform } from 'react-native';
import { Task } from '../../data/store/types';
import { fromLocalISOString } from './dateFormatter';

async function ensureChannelExists() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'task_reminders',
      name: 'Recordatorios de tareas',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      lights: true,
    });
  }
}

export const scheduleLocalNotification = async (task: Task): Promise<void> => {
  if (!task.reminderDate || task.completed) return;

  // Usar fromLocalISOString para parsear correctamente
  const triggerDate = fromLocalISOString(task.reminderDate);
  
  if (!triggerDate) {
    console.warn('Fecha de recordatorio inválida:', task.reminderDate);
    return;
  }

  const now = Date.now();
  const triggerTime = triggerDate.getTime();
  
  const diffMs = triggerTime - now;
  const diffSeconds = Math.floor(diffMs / 1000);

  // console.log('Fecha actual:', new Date(now).toLocaleString());
  // console.log('Fecha trigger:', triggerDate.toLocaleString());
  // console.log('Diferencia:', diffSeconds, 'segundos');

  // Margen de seguridad: mínimo 30 segundos en el futuro
  const MIN_SECONDS_AHEAD = 30;
  
  if (diffSeconds < MIN_SECONDS_AHEAD) {
    console.warn('Recordatorio debe ser al menos', MIN_SECONDS_AHEAD, 'segundos en el futuro');
    // console.warn('   Trigger:', triggerDate.toLocaleString());
    // console.warn('   Ahora:', new Date().toLocaleString());
    // console.warn('   Diferencia:', diffSeconds, 'segundos');
    return;
  }

  await ensureChannelExists();

  const notificationId = `task_${task.id}`;

  try {
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: 'Recordatorio de tarea',
        body: task.title,
        data: { taskId: task.id.toString() },
        android: {
          channelId: 'task_reminders',
          smallIcon: 'ic_launcher',
          pressAction: { id: 'default' },
          importance: AndroidImportance.HIGH,
          autoCancel: false,
          timestamp: triggerTime, 
          showTimestamp: true,
        },
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTime, 
      }
    );
    console.log('Notificación programada para:', triggerDate.toLocaleString(), `(en ${diffSeconds}s)`);
  } catch (error) {
    console.error(' Error programando notificación:', error);
    // console.error('   Timestamp usado (ms):', triggerTime);
    // console.error('   Timestamp actual (ms):', Date.now());
  }
};

export const cancelNotificationForTask = async (taskId: string): Promise<void> => {
  try {
    await notifee.cancelTriggerNotification(`task_${taskId}`);
    console.log('Notificación cancelada para task:', taskId);
  } catch (error) {
    console.log('Error cancelando notificación:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  await notifee.cancelAllNotifications();
  console.log('Todas las notificaciones canceladas');
};