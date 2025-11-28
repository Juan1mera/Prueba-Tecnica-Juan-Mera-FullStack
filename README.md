# Prueba Técnica FullStack - Juan Mera

##  Estructura del Proyecto

Este repositorio contiene la solución completa a la prueba técnica, organizada en las siguientes carpetas:

### [exercises/](https://github.com/Juan1mera/Prueba-Tecnica-Juan-Mera-FullStack/blob/main/exercises/README.md)
Contiene las soluciones a los ejercicios de programación en TypeScript:
- **Ejercicio 1**: Detector de palíndromos
- **Ejercicio 2**: Eliminación de duplicados en arrays de objetos
- **Ejercicio 3**: Rotación de matrices 90 grados

### [task_async_front/](https://github.com/Juan1mera/Prueba-Tecnica-Juan-Mera-FullStack/blob/main/task_async_front/README.md)
Aplicación móvil desarrollada en **React Native** que incluye:
- Interfaz de usuario 
- Navegación entre pantallas
- Integración con API backend
- Manejo de estados de carga y error

### [task_sync_back/](https://github.com/Juan1mera/Prueba-Tecnica-Juan-Mera-FullStack/blob/main/task_sync_back/README.md)
Servidor backend desarrollado en **Spring Boot** que proporciona:
- API RESTful completa
- Base de datos en MySQL
- Operaciones CRUD para gestión de tasks

---

## Respuesta a las Preguntas Técnicas


#### 1.1 React / React Native

**1. Diferencia entre useEffect, useMemo y useCallback:**

- **useEffect**: Para efectos secundarios (llamadas API, suscripciones). Se ejecuta después del renderizado.
- **useMemo**: Para memoizar cálculos costosos. Cachea el resultado de una función.
- **useCallback**: Para memoizar funciones y evitar recreaciones innecesarias.

En móviles useMemo y useCallback son cruciales para evitar renders innecesarios y mejorar el rendimiento, especialmente en listas grandes.

**2. Manejo de:**

- **Cache de datos**: Con React Query, usar `staleTime` y `cacheTime` para controlar la frescura de datos.
- **Sincronización offline → online**: Implementar un sistema de cola de peticiones fallidas y reenviarlas cuando se recupere la conexión.
- **Prevención de doble request**: Usar `useEffect` con cleanup, cancelación de peticiones con AbortController, o estados de loading.

**3. Expo vs React Native CLI:**

- **Expo**: Más rápido para empezar, maneja builds automáticos, pero menos flexibilidad con native modules.
- **RN CLI**: Mayor control, acceso directo a código nativo, pero configuración más compleja.

**Para proyecto productivo**: Expo con **development builds** para tener acceso a native modules manteniendo la facilidad de deployment.

**4. Optimización en React Native:**

- **Listas**: VirtualizedList o FlashList para listas grandes.
- **Navegación**: Lazy loading de pantallas, memoización de componentes.
- **Bundle**: Code splitting, tree shaking, usar Hermes.
- **Imágenes**: Optimizar tamaños, usar formatos WebP, lazy loading.

#### 1.2 Arquitectura y Backend

### 5. Arquitectura simple propuesta
La arquitectura propuesta es simple, consta de la aplicación React Native la cual se comunica mediante HTTP con un API. La autenticación se basa en JWT con refresh tokens, guardando el refresh token de forma segura en Keychain/SecureStore y renovando automáticamente el access token cuando expira. 
Para mejorar la experiencia offline y la velocidad, la app mantiene un caché local con MMKV donde lee datos de forma inmediata y escribe mutaciones de forma optimista; las operaciones que fallan por falta de conexión se encolan y se reenvían automáticamente en background en cuanto la red vuelve, usando NetInfo y AppState. De esta forma se consigue que la app sea rápida, no sea vulnerable a cortes de conexión y con una backend fácil de escalar
![Texto alternativo](diagram.png)
[plantUml](https://www.plantuml.com/plantuml/uml/NLFDRjGm4BxxAOQUG5LPJXmGGlsXWj9kMveLFR08ZPpPZRN9J6GxQLU8X-41EF48VJ76SLPAzn95yttVVDzuxECGqSUkgSsBM553qDRes8IDunOzDX0gBEN1yHfMM0UQ82mb1MhXxPj9qIDlng9fqMvmJN3mqOLMWekk5sYU_lMkFe1V1k3xITl27Q6DS8sAqf9VdZ-s0ZEukuQpgujNFm03A2kHpz1M1BLOhE4GhDG8ibhLZbKsdrz-KzL9sB8jedYr7QI39eaBifsd197oBcbhAtIiVfvMda85KJR4sIzpa-fK9rXxwRY4GZil-PhY1Qz4_JLK4J5ccmIQtvE9av1KDOEpMhfoD-xj1NnIpGDkrPdNZXzJwFj2lnJjwsm_CWP15okDutjdTSWlzmirlXi3BrBWGP1OYJrtraiOs4vWWM4JbboqFYtlL2IgUBujlbubKOQJwYQg29gfDWoCcrYH3scijAQZem-xPF0EFYyMjuNsEoNqv46JcHsen9neMiXkqyhOVUoT9ThuzgPOmAmMFHkJIWEc78NGMWhXvx0eE5pokBbSsFKPbwVqTOU-H7ZEokZKSCJ1TiYb03sspkE-DNVKoxC0EVXxfUGxfgIQREmypYXOxzAVoOXoXWkYbAQBQ9qm1MY9IqSSAPW4xfsl9-B-wQ-CiPRSTrJt1CBflXl34WcyMrSHP3K-aAli3uv3H8vFVvWGIWebWHsVmVak6aWRNUEKkFUKZCQ2rDsOO_tjcle_)

**7. CI/CD para React Native:**

- **EAS Build**: Configurar builds para diferentes entornos (dev, staging, prod)
- **Fastlane**: Automatización de deployment a stores
- **GitHub Actions**: Pipeline de tests, linting y builds automáticos
- **Code signing**: Gestión automática de certificados

---

## Ejecución del Proyecto

Cada módulo contiene su propia documentación detallada con instrucciones de instalación y ejecución. Consulta los README individuales para más información.

### Requisitos Previos
- Node.js 16+
- Java 17+
- Android Studio / Xcode (para desarrollo móvil)
- Git


---
*Desarrollado por Juan Mera - Prueba Técnica FullStack*