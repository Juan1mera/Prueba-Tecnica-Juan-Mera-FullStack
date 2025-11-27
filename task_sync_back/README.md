# TaskSync API REST - Documentación

API REST para gestión de tareas simple y eficiente.  
Proyecto Spring Boot 3 + JPA + MySQL + Lombok.

## Requisitos para desplegar

- Java 21 o superior
- MySQL 8.0+
- Maven 3.8+

## Variables de entorno obligatorias (.env o export)

```bash
DB_URL=jdbc:mysql://localhost:3306/tasksync_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=
DB_PASSWORD=
```
Estas variables de entorno se cargan en el aplication.yml

## Para ejecutar

```bash
git clone git@github.com:Juan1mera/Prueba-Tecnica-Juan-Mera-FullStack.git
cd Prueba-Tecnica-Juan-Mera-FullStack
./mvnw spring-boot:run
```

La API quedará disponible en: http://localhost:3000

## Endpoints

Base URL: `/api/tasks`

| Método   | URL                        | Descripción                         | Body requerido                                 | Respuesta exitosa                     |
|---------|----------------------------|--------------------------------------|------------------------------------------------|---------------------------------------|
| GET     | `/api/tasks`               | Lista todas las tareas     | Ninguno                                        | 200 + `TaskPageResponseDto`          |
| GET     | `/api/tasks/{id}`          | Obtiene una tarea por ID             | Ninguno                                        | 200 + `TaskResponseDto`               |
| POST    | `/api/tasks`               | Crea una nueva tarea                 | `{ "title": "...", "content": "..." }`         | 201 + `TaskResponseDto`               |
| PUT     | `/api/tasks/{id}`          | Actualiza título y contenido         | `{ "title": "...", "content": "..." }`         | 200 + `TaskResponseDto`               |
| PATCH   | `/api/tasks/{id}/toggle`   | Cambia estado completed / !completed | Ninguno                                        | 200 + `TaskResponseDto`               |
| DELETE  | `/api/tasks/{id}`          | Elimina una tarea                    | Ninguno                                        | 204 No Content                        |

### Parámetros de paginación (GET /api/tasks)

| Parámetro | Tipo    | Default | Descripción                   |
|----------|---------|---------|-------------------------------|
| page     | int     | 0       | Número de página (0-indexed)  |
| size     | int     | 10      | Cantidad de tareas por página |

Ejemplo: `GET /api/tasks?page=0&size=20`


### Formato de respuesta paginada (GET /api/tasks)

```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Hacer backup",
      "content": "Backup semanal del servidor",
      "completed": false,
      "createdAt": "2025-11-27T10:30:00",
      "updatedAt": "2025-11-27T10:30:00"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 42,
  "totalPages": 5,
  "last": false
}
```
