package com.juanmera.tasksync.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskRequestDto(

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 255, message = "El título no puede exceder los 255 caracteres")
        String title,

        @NotBlank(message = "El contenido es obligatorio")
        String content

) {}