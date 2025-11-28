// src/screens/HomeScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import TaskItem from '../components/TaskItem';
import OfflineBanner from '../components/OfflineBanner';
import ErrorBanner from '../components/ErrorBanner';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { homeScreenStyles } from './HomeScreenStyles';
import { useTaskStore } from '../../data/store/taskStore';
import { useNetworkStatus } from '../../core/hooks/useNetworkStatus';
import { RootStackParamList, Task } from '../../data/store/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const {
    tasks,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    searchQuery,
    fetchTasks,
    loadMoreTasks,
  } = useTaskStore();

  useNetworkStatus();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = () => {
    fetchTasks(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !searchQuery) {
      loadMoreTasks();
    }
  };

  const handleCreateTask = () => {
    navigation.navigate('Task'); // ← sin params = creación
  };

  const handleEditTask = (task: Task) => {
    navigation.navigate('Task', { taskId: task.id }); // ← con taskId = edición
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={homeScreenStyles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={homeScreenStyles.footerText}>Cargando más tareas...</Text>
      </View>
    );
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={homeScreenStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={homeScreenStyles.loadingText}>Cargando tareas...</Text>
      </View>
    );
  }

  return (
    <View style={homeScreenStyles.container}>
      <OfflineBanner />
      <ErrorBanner />

      <View style={homeScreenStyles.header}>
        <Text style={homeScreenStyles.headerTitle}>Mis Tareas</Text>
        <View style={homeScreenStyles.headerStats}>
          <Text style={homeScreenStyles.statsText}>
            {tasks.filter(t => !t.completed).length} pendientes
          </Text>
          <Text style={homeScreenStyles.statsSeparator}>•</Text>
          <Text style={homeScreenStyles.statsText}>
            {tasks.filter(t => t.completed).length} completadas
          </Text>
        </View>
      </View>

      <SearchBar />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem task={item} onEdit={handleEditTask} />
        )}
        ListEmptyComponent={<EmptyState isSearching={!!searchQuery} />}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={
          tasks.length === 0 ? homeScreenStyles.emptyList : homeScreenStyles.list
        }
      />

      <TouchableOpacity style={homeScreenStyles.fab} onPress={handleCreateTask}>
        <Text style={homeScreenStyles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}