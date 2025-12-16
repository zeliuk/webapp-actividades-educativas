# Plataforma de Actividades Educativas

Proyecto basado en **Next.js**, **Firebase** y **TailwindCSS**, cuyo
objetivo es crear una plataforma en la que los docentes puedan:

- Crear actividades educativas interactivas.
- Guardarlas en su biblioteca personal.
- Configurar privacidad (privada / pública entre docentes).
- Compartirlas fácilmente con alumnos mediante enlace directo.
- Buscar y reutilizar actividades públicas entre docentes.
- Utilizar plantillas como Quiz, Emparejar, Completar huecos (en sprints siguientes).

Este repositorio contiene la base completa del sistema: autenticación,
internacionalización, gestión de actividades, vista profesor y vista alumno.

---

## 🚀 Tecnologías principales

| Tecnología               | Uso                                   |
|--------------------------|----------------------------------------|
| **Next.js (App Router)** | Framework principal del frontend       |
| **Firebase Authentication** | Registro/login (email y Google)     |
| **Firestore**            | Base de datos NoSQL                    |
| **TailwindCSS**          | Estilos y diseño rápido                |
| **react-hook-form**      | Gestión de formularios                 |
| **Zod**                  | Validación de formularios              |
| **i18next**              | Internacionalización (ES/EN)           |
| **Sonner**               | Sistema global de notificaciones       |

---

# 🧱 Arquitectura del Proyecto

```
src/
 ├── app/
 │    ├── (auth)/
 │    │     ├── login/
 │    │     └── register/
 │    ├── a/                        → Vista pública para alumnos
 │    │     └── [id]/page.tsx
 │    ├── dashboard/
 │    │     ├── activities/
 │    │     │     ├── page.tsx              → Listado de actividades
 │    │     │     ├── [id]/page.tsx         → Editor de actividad
 │    │     │     ├── [id]/preview/page.tsx → Vista previa
 │    │     │     └── [id]/results/page.tsx → Resultados de alumnos
 │    │     ├── layout.tsx
 │    │     └── page.tsx
 │    └── layout.tsx
 │
 ├── components/
 │    ├── AuthCard.tsx
 │    ├── ActivityCard.tsx
 │    └── ui/
 │         ├── Button.tsx
 │         └── Input.tsx
 │
 ├── context/
 │    └── AuthContext.tsx
 │
 ├── lib/
 │    ├── authService.ts
 │    ├── activitiesService.ts
 │    ├── firebase.ts
 │    └── validationSchemas.ts
 │
 └── i18n/
      ├── i18n-config.ts
      ├── index.ts
      └── locales/
           ├── es/common.json
           └── en/common.json
```

---

# 🔐 Autenticación implementada (Sprint 1)

- ✔ Registro con email  
- ✔ Login con email  
- ✔ Login / Registro con Google  
- ✔ Guardado del usuario en Firestore  
- ✔ Persistencia de sesión con `onAuthStateChanged`  
- ✔ Rutas protegidas con `AuthGuard`  
- ✔ Dashboard privado para docentes  
- ✔ Sistema global de notificaciones (Sonner)  

---

# 🌍 Internacionalización (i18n)

El proyecto soporta multilenguaje:

- Idiomas incluidos: **Español (es)** y **Inglés (en)**
- Traducciones gestionadas en `/i18n/locales/`
- `useTranslation` integrado en todas las vistas

---

# 🔥 Reglas de Firestore (Producción)

Reglas completas para actividades, alumnos y profesores:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /activities/{activityId} {

      function isOwner() {
        return request.auth != null &&
               request.auth.uid == resource.data.ownerId;
      }

      function isCreatingOwnDoc() {
        return request.auth != null &&
               request.auth.uid == request.resource.data.ownerId;
      }

      allow read: if true;
      allow create: if isCreatingOwnDoc();
      allow update, delete: if isOwner();

      match /attempts/{attemptId} {

        allow create: if true;

        allow read: if request.auth != null &&
                     request.auth.uid ==
                       get(/databases/$(database)/documents/activities/$(activityId)).data.ownerId;

        allow update, delete: if false;
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

# 🧩 Funcionalidades actuales (Sprint 2 COMPLETADO)

### 📌 Gestión de Actividades
- ✔ CRUD completo (crear, editar, borrar, listar)  
- ✔ Selección de idioma de actividad  
- ✔ Privacidad para compartir entre docentes  
- ✔ Vista previa del profesor  
- ✔ Copiar enlace para compartir con alumnos  

### 📌 Editor Visual de Quiz
- ✔ Añadir preguntas  
- ✔ Eliminar preguntas  
- ✔ Duplicar preguntas  
- ✔ Reordenar preguntas  
- ✔ Editar opciones  
- ✔ Definir respuesta correcta  
- ✔ Guardado completo en Firestore  

### 📌 Editor Visual de Anagramas
- ✔ Añadir varias palabras y pistas individuales  
- ✔ Reordenar o eliminar palabras fácilmente  
- ✔ Previsualizar el orden en que se mostrarán al alumnado  
- ✔ Todas las palabras se guardan dentro de `data.anagrams` para cada actividad  

### 📌 Vista Alumnado `/a/[id]`
- ✔ Acceso siempre disponible sin login  
- ✔ Pantalla para introducir nombre  
- ✔ Interfaz interactiva de respuesta  
- ✔ Selección de opción  
- ✔ Retroalimentación inmediata  
- ✔ Cálculo de puntuación  
- ✔ Mensajes motivacionales  
- ✔ Reintentar actividad  

#### 🧠 Modo Quiz
- Auto‑avance tras responder (con feedback verde/rojo antes de pasar a la siguiente)
- Bloqueo de cambios una vez respondida cada pregunta
- Envío automático al completar todas las preguntas, incluso si solo hay una
- Resumen final resaltando respuestas correctas e incorrectas

#### 🔤 Modo Anagramas
- Presenta letras desordenadas con arrastrar/soltar, clics o teclado
- Casillas vacías muestran el progreso palabra a palabra
- Temporizador global y estado “Palabra completada”
- Se puede saltar entre palabras y volver cuando se desee

### 📌 Intentos guardados en Firestore
- ✔ Subcolección `attempts` por actividad  
- ✔ Guarda nombre del alumno  
- ✔ Guarda respuestas, aciertos y porcentaje (Quiz y Anagram)  
- ✔ Timestamp automático  
- ✔ Almacena la duración total del intento  
- ✔ Compatible con alumnos sin cuenta  

### 📌 Resultados del Profesor
- ✔ Tabla de intentos  
- ✔ Fecha, nombre, puntuación y porcentaje  
- ✔ Estadísticas por pregunta  
- ✔ Porcentaje de aciertos  
- ✔ Identificación de preguntas más falladas  

---

# ▶️ Puesta en marcha

## 1️⃣ Clonar el repositorio

```
git clone <tu-repo>
cd <tu-repo>
```

## 2️⃣ Instalar dependencias

```
npm install
```

## 3️⃣ Configurar variables de entorno

Crear `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
```

## 4️⃣ Ejecutar

```
npm run dev
```

App disponible en **http://localhost:3000**

---

# 🎯 Siguientes pasos (Sprint 3)

- Biblioteca pública entre docentes  
- Nuevos tipos de actividades  
- Código QR para compartir  
- Exportación de resultados (CSV/PDF)  
- Mejoras visuales globales y layout unificado  

---

# 📜 Licencia

Proyecto en desarrollo.
