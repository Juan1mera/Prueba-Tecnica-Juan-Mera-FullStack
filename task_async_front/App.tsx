import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import notifee from '@notifee/react-native';
import { Platform } from 'react-native';
import TaskScreen from './src/presentation/screens/task_screen/TaskScreen';
import { RootStackParamList } from './src/data/store/types';
import HomeScreen from './src/presentation/screens/home_screen/HomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

async function requestPermissions() {
  await notifee.requestPermission({
    alert: true,
    badge: true,
    sound: true,
  });

  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'task_reminders',
      name: 'Recordatorios de tareas',
      importance: 4,
      sound: 'default',
    });
  }
}

export default function App() {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Task" component={TaskScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}