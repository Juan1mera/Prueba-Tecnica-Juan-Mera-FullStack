# TaskSync - React Native Task Management App

Aplicación movil de gestión de tareas desarrollada en React Native CLI con funcionalidades offline-first y sincronización automática.

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Funcionalidades Nativas](#funcionalidades-nativas)
- [Mejoras Futuras](#mejoras-futuras)

## Requisitos

- **Node.js** >= 20.x
- **React Native CLI** 0.82.1
- **Android Studio** (para desarrollo Android)
- **Xcode** (para desarrollo iOS, solo en macOS)
- **Java Development Kit (JDK)** 11 o superior

## Instalación y Ejecución

### 1. Clonar e instalar dependencias
```bash
git clone git@github.com:Juan1mera/Prueba-Tecnica-Juan-Mera-FullStack.git
cd Prueba-Tecnica-Juan-Mera-FullStack/task_async_front
npm install
```

### 2. Configuración para Android
```bash
# Ejecutar en modo desarrollo
npm run android

# O directamente con React Native CLI
npx react-native run-android
```

### 3. Configuración para iOS
```bash
# Instalar dependencias de iOS
cd ios && pod install && cd ..

# Ejecutar aplicación
npm run ios
```

### 4. Servidor de desarrollo
```bash
npm start
```

### 5. Configuración del backend
La aplicación espera un backend corriendo en:
```
http://tu_ipv4_personal:3000/api/tasks
```

Al desplegar la api usando la imagen de docker en 'task_sync_back' tendras que revisar la ipv4 de tu pc

## Arquitectura del Proyecto

```
.
├── core/           # Lógica de negocio y utilidades
│   ├── hooks/      # Custom hooks reutilizables
│   └── utils/      # Utilidades generales (notificaciones, storage)
├── data/           # Capa de datos
│   ├── api/        # Servicios y cliente HTTP
│   └── store/      # Estado global (Zustand)
└── presentation/   # Capa de presentación
    ├── components/ # Componentes reutilizables
    ├── screens/    # Pantallas principales
    └── theme/      # Configuración de temas
```

### Patrón de Arquitectura
La aplicación sigue una arquitectura **por capas** simplificada:
- **Presentation**: Componentes UI y pantallas
- **Data**: Gestión de estado y comunicación con API
- **Core**: Lógica de negocio y utilidades compartidas

## Decisiones Técnicas

### Gestión de Estado: Zustand vs Alternativas

**¿Por qué Zustand?**

- **Simplicidad**: API mínima y fácil de entender
- **TypeScript**: Soporte nativo excelente sin configuración compleja
- **Persistencia**: Integración directa con AsyncStorage


### React Native CLI vs Expo

**Elección: React Native CLI**

- **Compilación más rápida**: Sin tiempos de espera largos de Expo build services
- **Acceso directo a APIs nativas**: Sin necesidad de EAS o configuraciones complejas
- **Flexibilidad**: Control total sobre el proyecto nativo
- **Tiempo**: Configuracion inicial y despliegue mas rapido

### Otras Decisiones Importantes

1. **URLs hardcodeadas**: Para desarrollo rápido, sin variables de entorno
2. **Arquitectura simple**: Sin patrones complejos como Clean Architecture o DDD
3. **Offline-first**: Sincronización automática cuando vuelve la conexión
5. **Notificaciones locales**: Usando notifee para máxima compatibilidad

## Funcionalidad Nativa

### Notificaciones Programadas

La aplicación utiliza **@notifee/react-native** para notificaciones locales avanzadas:

```typescript
// Programar notificación para recordatorio de tarea
await scheduleLocalNotification(task);

// Configuración para Android
android: {
  channelId: 'task_reminders',
  importance: AndroidImportance.HIGH,
  sound: 'default',
  vibration: true,
  lights: true,
}
```

**Características:**
- Notificaciones persistentes con timestamp
- Cancelación automática al completar tareas
- Manejo de eventos en segundo plano


## Mejoras Futuras

### Funcionalidades Nativas Extras

**Cámara y Multimedia**
- Selección de imágenes desde galería o cámara
- Subida a cloud storage (Firebase/Supabase)
- Adjuntar imágenes a tareas

**Integración con GPS**
- Captura de coordenadas (latitud/longitud)
- Integración con Google Maps SDK
- Geocoding inverso para direcciones legibles
- Places API para selección de ubicaciones

**Deep Linking**
- Enlaces directos a tareas específicas
- Integración con React Navigation
- Compartir tareas via URL

### Mejoras de Producto

**Autenticación y Usuarios**
- Sistema de registro/login
- Perfiles de usuario
- Sincronización multi-dispositivo

**Colaboración**
- Compartir tareas con otros usuarios
- Comentarios y asignaciones
- Notificaciones push para colaboraciones

**Características Avanzadas**
- Categorías y etiquetas
- Búsqueda avanzada con filtros
- Exportar y generar informes
- Modo oscuro de la aplicacion

### Mejoras Técnicas

**Infraestructura**
- Variables de entorno para configuración
- Testing E2E con Detox
- Monitoreo de errores (Sentry)


## Errores

### Problemas durante el desarrollo

**Error de conexión con backend:**
- Mi migracion a react native cli fue debido a la dificultad con expo para poder hacer peticiones a una api local
- Para facilidad de uso y evitar errores en el backend hago uso de la ipv4 del dispositivo

**Problemas con notificaciones en Android:**
- Verifica los canales de notificación
- Confirma permisos de notificación
- Revisa configuración de "No Molestar"

**Problemas de sincronización offline:**
- Bug de duplicado, al ejecutar cualquier accion en el modo offline al conectarse se ejecutaba dos veces
- Se guardaba en cola acciones aunque se ejecutaran en modo online

