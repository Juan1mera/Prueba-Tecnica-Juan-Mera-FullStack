package com.juanmera.tasksync.controllers;

import com.juanmera.tasksync.dtos.TaskPageResponseDto;
import com.juanmera.tasksync.dtos.TaskRequestDto;
import com.juanmera.tasksync.dtos.TaskResponseDto;
import com.juanmera.tasksync.services.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // GET todas las tareas
    @GetMapping
    public ResponseEntity<TaskPageResponseDto> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        TaskPageResponseDto response = taskService.findAll(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<TaskPageResponseDto> searchTasks(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        TaskPageResponseDto response = taskService.search(q, page, size);
        return ResponseEntity.ok(response);
    }


    // GET una tarea por ID
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDto> getTaskById(@PathVariable String id) {
        TaskResponseDto task = taskService.findById(id);
        return ResponseEntity.ok(task);
    }

    // POST crear nueva tarea
    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(@Valid @RequestBody TaskRequestDto request) {
        TaskResponseDto created = taskService.create(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT actualizar tarea
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDto> updateTask(
            @PathVariable String id,
            @Valid @RequestBody TaskRequestDto request) {
        TaskResponseDto updated = taskService.update(id, request);
        return ResponseEntity.ok(updated);
    }

    // PATCH toggle completed
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskResponseDto> toggleTaskCompleted(@PathVariable String id) {
        TaskResponseDto toggled = taskService.toggleCompleted(id);
        return ResponseEntity.ok(toggled);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}