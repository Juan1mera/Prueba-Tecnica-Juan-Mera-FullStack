# TaskSync API – Backend Spring Boot 3

![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java 21](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-3.9+-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)

**API REST moderna, limpia y eficiente** para gestión de tareas.  
Desarrollada con Spring Boot 3, JPA, MySQL, UUIDs, paginación nativa y buenas prácticas.

**URL base en desarrollo:** `http://localhost:3000/api/tasks`

## Características técnicas

- Spring Boot 3.x + Java 21
- Spring Data JPA + Hibernate
- MySQL 8.0
- UUID como IDs (no autoincrementales)
- Paginación y ordenamiento nativo
- Respuestas DTO bien tipadas
- Lombok + records
- Configuración limpia vía `application.yml`

## Requisitos previos

| Herramienta       | Versión mínima     | Notas                                |
|-------------------|--------------------|--------------------------------------|
| Java JDK          | 21                 | Recomendado Temurin / Oracle JDK     |
| MySQL             | 8.0+               | Local o vía Docker                   |
| Maven             | 3.8.6+             | Viene incluido (`./mvnw`)            |

## Ejecución rápida (2 opciones)

### Opción 1 – Con Docker Compose (Mas rapido)

Desde la raíz del repositorio:
> **Nota importante**: Asegurarse de tener la app de docker abierta

```bash
git clone git@github.com:Juan1mera/Prueba-Tecnica-Juan-Mera-FullStack.git
cd Prueba-Tecnica-Juan-Mera-FullStack/task_sync_back
docker-compose up -d --build
```
- Levanta MySQL + la API automáticamente  
- Base de datos creada automáticamente (`tasksync_db`)
- Todo en una imagen de docker

### Opción 2 – Manual

1. Clona el proyecto:
  ```bash
  git clone git@github.com:Juan1mera/Prueba-Tecnica-Juan-Mera-FullStack.git
  cd Prueba-Tecnica-Juan-Mera-FullStack/task_sync_back
  ```
2. Crea la base de datos:
   ```sql
   CREATE DATABASE tasksync_db;
   ```


3. Configura las variables de entorno (o crea un `.env` en la raíz del backend):

  ```env
  DB_URL=jdbc:mysql://localhost:3306/tasksync_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
  DB_USERNAME=tu_usuario
  DB_PASSWORD=tu_password
  ```

4. Ejecuta:
  ```bash
  ./mvnw spring-boot:run
  ```

**API disponible en:** http://localhost:3000/api/tasks

## Endpoints disponibles

**Base URL:** `/api/tasks`

| Método | Endpoint                     | Descripción                          | Body requerido                                 | Respuesta exitosa      |
|--------|------------------------------|--------------------------------------|------------------------------------------------|------------------------|
| GET    | `/api/tasks`                 | Lista todas las tareas (paginado)    | Ninguno                                        | `200` + lista paginada |
| GET    | `/api/tasks/{id}`            | Obtiene una tarea por ID             | Ninguno                                        | `200` + tarea          |
| POST   | `/api/tasks`                 | Crea una nueva tarea                 | `title`, `content` (opcional)                  | `201` + tarea creada   |
| PUT    | `/api/tasks/{id}`            | Actualiza título y contenido         | `title`, `content`                             | `200` + tarea          |
| PATCH  | `/api/tasks/{id}/toggle`     | Alterna estado completado            | Ninguno                                        | `200` + tarea          |
| DELETE | `/api/tasks/{id}`            | Elimina una tarea                    | Ninguno                                        | `204 No Content`       |

### Paginación y ordenamiento (GET /api/tasks)

| Parámetro | Tipo   | Valor por defecto | Descripción                          |
|---------|--------|-------------------|---------------------------------------|
| page    | int    | 0                 | Página (0-indexed)                    |
| size    | int    | 10                | Elementos por página (máx 100)        |
| sort    | string | createdAt,desc    | Orden: `property,asc\|desc`           |

**Ejemplos:**
- `GET /api/tasks?page=0&size=20`
- `GET /api/tasks?sort=title,asc`

### Ejemplos de requests

#### Crear tarea
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Terminar prueba técnica", "content": "FullStack con React Native + Spring Boot"}'
```

#### Alternar estado
```bash
curl -X PATCH http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000/toggle
```

## Modelo de datos (Task)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Hacer la compra",
  "content": "Leche, pan, huevos...",
  "completed": false,
  "createdAt": "2025-11-28T10:30:00Z",
  "updatedAt": "2025-11-28T15:45:00Z"
}
```

## Base de datos

Tabla creada automáticamente por JPA/Hibernate:

```sql
CREATE TABLE task (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

## Estructura del proyecto

```
task_sync_back/
├── src/main/java/com.example.tasksync/
│   ├── controller/    → TaskController
│   ├── service/       → TaskService
│   ├── repository/    → TaskRepository (Spring Data JPA)
│   ├── model/         → Task (entity) + DTOs
│   └── TasksApplication.java
├── docker-compose.yml
└── pom.xml
```

## Pruebas rápidas con curl

```bash
# Listar tareas
curl http://localhost:3000/api/tasks

# Crear tarea
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title":"Nueva tarea"}'

# Marcar como completada
curl -X PATCH http://localhost:3000/api/tasks/{id}/toggle
```

## Autor

**Juan Mera**  
FullStack Developer – Java Spring Boot & React Native CLI

28 de noviembre de 2025
