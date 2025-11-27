package com.juanmera.tasksync.dtos;

import java.util.List;

public record TaskPageResponseDto(
        List<TaskResponseDto> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean last
) {}