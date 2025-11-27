package com.juanmera.tasksync.services;

import com.juanmera.tasksync.dtos.TaskRequestDto;
import com.juanmera.tasksync.dtos.TaskResponseDto;
import com.juanmera.tasksync.models.Task;
import com.juanmera.tasksync.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public List<TaskResponseDto> findAll() {
        return taskRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public TaskResponseDto findById(String id) {
        return taskRepository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    public TaskResponseDto create(TaskRequestDto request) {
        Task task = new Task();
        task.setTitle(request.title());
        task.setContent(request.content());
        task.setCompleted(false);

        Task saved = taskRepository.save(task);
        return toResponseDto(saved);
    }

    public TaskResponseDto update(String id, TaskRequestDto request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setTitle(request.title());
        task.setContent(request.content());

        Task updated = taskRepository.save(task);
        return toResponseDto(updated);
    }

    public TaskResponseDto toggleCompleted(String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setCompleted(!task.isCompleted());
        return toResponseDto(taskRepository.save(task));
    }

    public void delete(String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    // Mapper privado
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