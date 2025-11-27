package com.juanmera.tasksync.services;

import com.juanmera.tasksync.dtos.TaskRequestDto;
import com.juanmera.tasksync.dtos.TaskResponseDto;
import com.juanmera.tasksync.exceptions.ResourceNotFoundException;
import com.juanmera.tasksync.models.Task;
import com.juanmera.tasksync.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    // GET todas las tareas
    public List<TaskResponseDto> findAll() {
        return taskRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    // GET por ID
    public TaskResponseDto findById(String id) {
        return taskRepository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con id: " + id));
    }

    // POST crear tarea
    public TaskResponseDto create(TaskRequestDto request) {
        Task task = new Task();
        task.setTitle(request.title());
        task.setContent(request.content());
        task.setCompleted(false);

        Task saved = taskRepository.save(task);
        return toResponseDto(saved);
    }

    // PUT actualizar tarea
    public TaskResponseDto update(String id, TaskRequestDto request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con id: " + id));

        task.setTitle(request.title());
        task.setContent(request.content());

        return toResponseDto(taskRepository.save(task));
    }

    // PATCH toggle completed
    public TaskResponseDto toggleCompleted(String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con id: " + id));

        task.setCompleted(!task.isCompleted());
        return toResponseDto(taskRepository.save(task));
    }

    // DELETE tarea
    public void delete(String id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tarea no encontrada con id: " + id);
        }
        taskRepository.deleteById(id);
    }

    private TaskResponseDto toResponseDto(Task task) {
        return new TaskResponseDto(
                task.getId(),
                task.getTitle(),
                task.getContent(),
                task.isCompleted(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}