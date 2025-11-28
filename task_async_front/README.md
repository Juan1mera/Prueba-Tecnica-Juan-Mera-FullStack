
# TaskSync – App Móvil de Tareas (React Native CLI)

![React Native CLI](https://img.shields.io/badge/React_Native_CLI-0.82.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-Latest-000000?style=for-the-badge&logo=zustand&logoColor=white)
![MMKV](https://img.shields.io/badge/MMKV-Fastest-4A90E2?style=for-the-badge)
![Notifee](https://img.shields.io/badge/Notifee-Advanced_FF5A5F?style=for-the-badge)

**Aplicación completa de gestión de tareas** desarrollada con **React Native CLI (bare workflow)**, arquitectura offline-first, sincronización automática, notificaciones locales programadas y rendimiento optimizado.

## Características principales

- Offline-first con caché ultra-rápido (MMKV)
- Sincronización automática al recuperar conexión
- Mutaciones optimistas
- Notificaciones locales programadas (Notifee)
- Estado global ligero con Zustand
- Arquitectura por capas clara y escalable
- 100 % TypeScript


## Requisitos previos (obligatorios)

| Herramienta                | Versión mínima       | Notas                                      |
|----------------------------|----------------------|--------------------------------------------|
| Node.js                    | ≥ 20.x               | Recomendado 20 o 22 (LTS)                  |
| npm / yarn / pnpm          | Última versión       | Se usa `npm` en los scripts                |
| Java JDK                   | 11 o 17              | Necesario para Android                     |
| Android Studio             | Última versión       | Con SDK 34+ y Android Emulator             |
| Xcode (solo macOS)         | ≥ 15.0               | Para compilar iOS                          |
| Watchman (macOS recomendado) | Última versión    | Mejora rendimiento de Metro                |

## Instalación y ejecución paso a paso

### 1. Clonar el repositorio
```bash
git clone https://github.com/Juan1mera/Prueba-Tecnica-Juan-Mera-FullStack.git
cd Prueba-Tecnica-Juan-Mera-FullStack/task_async_front
```

### 2. Instalar dependencias
```bash
npm install
# o si prefieres yarn/pnpm
# yarn install
# pnpm install
```

### 3. Instalar pods (solo iOS – macOS)
```bash
cd ios
pod install --repo-update
cd ..
```

### 4. Levantar el backend (¡IMPORTANTE!)
La app se comunica con el backend Spring Boot que está en la carpeta hermana:

```bash
# En otra terminal, desde la raíz del repositorio
cd ../task_sync_back
docker-compose up -d   # Opción más fácil
# o con Maven
./mvnw spring-boot:run
```

El backend quedará disponible en:  
**`http://TU_IPv4_LOCAL:3000/api/tasks`**

**Cómo obtener tu IPv4 local:**
- Windows: `ipconfig` → buscar "IPv4" en adaptador Wi-Fi/Ethernet
- macOS/Linux: `ifconfig` o `ip addr show` → buscar `inet` (ej: 192.168.1.50)

> **Nota importante**: La app tiene la URL hardcodeada a tu IP local por simplicidad de desarrollo.  
> Cambia la constante `BASE_URL` en `src/data/api/client.ts` si usas otro puerto o máquina.

### 5. Ejecutar la aplicación
> **Nota importante**: Asegurate de tener un emulador funcionando antes
#### Android (recomendado para pruebas rápidas)
```bash
npm run android
```
O directamente:
```bash
npx react-native run-android
```

#### iOS (solo macOS)
```bash
npm run ios
```

#### Metro Bundler (si no se inicia automáticamente)
```bash
npm start -- --reset-cache
```

La app se abrirá en tu emulador ya abierto 

## Estructura del proyecto

```
task_async_front/
├── core/                  -> Lógica de negocio y hooks reutilizables
│   ├── hooks/             -> useTasks, useSync, useAuth, etc.
│   └── utils/             -> notificaciones, storage, helpers
├── data/                  -> Capa de datos
│   ├── api/               -> Cliente Axios + interceptores
│   └── store/             -> Stores de Zustand con persistencia
├── presentation/          -> UI y pantallas
│   ├── components/        -> UI reutilizable
│   ├── screens/           -> Home, TaskDetail, Settings...
│   └── theme/             -> Colores, tipografía
├── App.tsx
└── index.js
```

**Arquitectura seguida**: Capas simples (Presentation ↔ Data ↔ Core) – limpia, mantenible y escalable.

## Decisiones técnicas clave

### React Native CLI (bare workflow) 
- Compilación mucho más rápida que Expo
- Acceso 100 % directo a módulos nativos
- Control total del proyecto Android/iOS
- Sin limitaciones de expo, como estar siempre conectado al wifi para pruebas de sincronizacion

### Zustand como estado global
- API mínima y extremadamente intuitiva
- Soporte nativo de TypeScript
- Persistencia integrada con MMKV (más rápido que AsyncStorage)
- Sin boilerplate (vs Redux)

### MMKV como almacenamiento local
- Hasta **50x más rápido** que AsyncStorage
- Lectura/escritura síncrona
- Perfecto para caché offline-first

### Notifee para notificaciones locales
- Máximo control en Android e iOS
- Canales, sonidos personalizados, luces, acciones
- Funciona en segundo plano y con la app cerrada

### Sincronización offline-first
- Cola de acciones pendientes
- Reintentos automáticos al volver a tener red
- Mutaciones optimistas para mejor UX
- Solución robusta a duplicados (bug ya corregido)

## Funcionalidades nativas implementadas

### Notificaciones locales programadas
```ts
await scheduleTaskReminder(task);
```
- Se crean al añadir recordatorio
- Se cancelan automáticamente al completar/eliminar tarea
- Funcionan aunque la app esté cerrada
- Configuración avanzada en Android (canal prioritario, vibración, luces)

## Próximas mejoras 

| Categoría             | Feature                                  |
|-----------------------|-------------------------------------------|
| Multimedia            | Adjuntar fotos a tareas                   
| GPS                   | Ubicación de tareas + mapas               
| Deep Linking          | Abrir tareas desde enlace                 
| Autenticación         | Login/Register + sincronización multi-device 
| Colaboración          | Compartir tareas con otros usuarios       
| Monitoreo             | Sentry para errores en producción         

## Solución de problemas comunes

| Problema                              | Solución                                                                 |
|---------------------------------------|--------------------------------------------------------------------------|
| No conecta con el backend             | Verificar tu IPv4 y que el backend esté en `http://TU_IP:3000`            |
| Notificaciones no aparecen (Android)  | ir a Ajustes → Apps → TaskSync → Notificaciones → Activar canal         |
| Duplicado de tareas al sincronizar    | Bug ya corregido – limpiar el storage con `npm run clean`                |
| Error de Gradle / build               | `./gradlew clean` en carpeta `android` y vuelve a compilar              |
| Metro no carga                        | `npm start -- --reset-cache`                                             |

## Autor

**Juan Mera**  
FullStack Developer – Especializado en React Native CLI & Spring Boot

28 de noviembre de 2025
