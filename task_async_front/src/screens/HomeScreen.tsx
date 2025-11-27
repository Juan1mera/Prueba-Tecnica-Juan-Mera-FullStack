import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { colors } from '../theme/colors';
import { useTaskStore } from '../store/taskStore';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import TaskItem from '../components/TaskItem';
import OfflineBanner from '../components/OfflineBanner';
import SearchBar from '../components/SearchBar';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import type { Task } from '../store/types';
import { homeScreenStyles } from './HomeScreenStyles';

export default function HomeScreen() {
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

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
    setEditingTask(null);
    setModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingTask(null);
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

      <TaskModal
        visible={modalVisible}
        onClose={handleCloseModal}
        task={editingTask}
      />
    </View>
  );
}

