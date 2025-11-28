import notifee, { AndroidImportance, TriggerType, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';
import { Task } from '../../data/store/types';

// Crear canal de notificaciones (solo Android)
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

// Programar una notificación local
export const scheduleLocalNotification = async (task: Task): Promise<void> => {
  if (!task.reminderDate || task.completed) return;

  const triggerDate = new Date(task.reminderDate);
  if (triggerDate <= new Date()) return;

  const notificationId = `task_${task.id}`;

  await ensureChannelExists();

  const timestamp = Math.floor(triggerDate.getTime() / 1000); // segundos

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
        // Esto hace que suene incluso en No Molestar (Android 8+)
        timestamp,
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
      timestamp,
      // alarm: true → ya no existe, pero AndroidImportance.HIGH + timestamp lo respeta
    }
  );
};

// Cancelar notificación de una tarea específica
export const cancelNotificationForTask = async (taskId: string): Promise<void> => {
  const notificationId = `task_${taskId}`;
  await notifee.cancelTriggerNotification(notificationId);
};

// Cancelar TODAS las notificaciones
export const cancelAllNotifications = async (): Promise<void> => {
  await notifee.cancelAllNotifications();
};

// Eventos cuando el usuario toca la notificación
notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('Notificación tocada (foreground):', detail.notification?.data);
  }
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('Notificación tocada (background/cerrada):', detail.notification?.data);
  }
});