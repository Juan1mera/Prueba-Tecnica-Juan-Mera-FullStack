package com.juanmera.tasksync.dtos;

import java.time.LocalDateTime;

public record TaskResponseDto(

        String id,
        String title,
        String content,
        boolean completed,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}