// src/main/java/com/juanmera/tasksync/dtos/TaskResponseDto.java

package com.juanmera.tasksync.dtos;

import java.time.LocalDateTime;

public record TaskResponseDto(
        String id,
        String title,
        String content,
        LocalDateTime dueDate,
        LocalDateTime reminderDate,
        boolean completed,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}