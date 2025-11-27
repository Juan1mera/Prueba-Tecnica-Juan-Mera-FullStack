package com.juanmera.tasksync.repositories;

import com.juanmera.tasksync.models.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    // Buscar tareas por título (búsqueda parcial, case-insensitive)
    List<Task> findByTitleContainingIgnoreCase(String title);

    // Buscar tareas completadas o no completadas
    List<Task> findByCompleted(boolean completed);

    // Ordenar por fecha de creación descendente
    List<Task> findAllByOrderByCreatedAtDesc();
}