package com.juanmera.tasksync.services;

import com.juanmera.tasksync.dtos.TaskPageResponseDto;
import com.juanmera.tasksync.dtos.TaskRequestDto;
import com.juanmera.tasksync.dtos.TaskResponseDto;
import com.juanmera.tasksync.exceptions.ResourceNotFoundException;
import com.juanmera.tasksync.models.Task;
import com.juanmera.tasksync.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    // GET todas las tareas
    public TaskPageResponseDto findAll(int page, int size) {
        Page<Task> taskPage = taskRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, size)
        );

        List<TaskResponseDto> content = taskPage.getContent()
                .stream()
                .map(this::toResponseDto)
                .toList();

        return new TaskPageResponseDto(
                content,
                taskPage.getNumber(),
                taskPage.getSize(),
                taskPage.getTotalElements(),
                taskPage.getTotalPages(),
                taskPage.isLast()
        );
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
        task.setDueDate(request.dueDate());
        task.setReminderDate(request.reminderDate());
        task.setCompleted(false);

        Task saved = taskRepository.save(task);
        return toResponseDto(saved);
    }

    public TaskResponseDto update(String id, TaskRequestDto request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con id: " + id));

        task.setTitle(request.title());
        task.setContent(request.content());
        task.setDueDate(request.dueDate());
        task.setReminderDate(request.reminderDate());

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

    public TaskPageResponseDto search(String q, int page, int size) {
        if (q == null || q.trim().isEmpty()) {
            // Si no hay término de búsqueda, devolvemos todo (o podrías lanzar error)
            return findAll(page, size);
        }

        String searchTerm = q.trim();

        Page<Task> taskPage = taskRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                searchTerm, searchTerm, PageRequest.of(page, size)
        );

        List<TaskResponseDto> content = taskPage.getContent()
                .stream()
                .map(this::toResponseDto)
                .toList();

        return new TaskPageResponseDto(
                content,
                taskPage.getNumber(),
                taskPage.getSize(),
                taskPage.getTotalElements(),
                taskPage.getTotalPages(),
                taskPage.isLast()
        );
    }

    private TaskResponseDto toResponseDto(Task task) {
        return new TaskResponseDto(
                task.getId(),
                task.getTitle(),
                task.getContent(),
                task.getDueDate(),
                task.getReminderDate(),
                task.isCompleted(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}