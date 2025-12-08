# Plataforma de Actividades Educativas

Proyecto basado en **Next.js**, **Firebase** y **TailwindCSS**, cuyo
objetivo es crear una plataforma en la que los docentes puedan:

-   Crear actividades educativas interactivas.
-   Guardarlas en su biblioteca personal.
-   Configurar privacidad (privada / pública).
-   Compartirlas con otros docentes o alumnos.
-   Buscar y reutilizar actividades públicas.
-   Utilizar plantillas como Quiz, Emparejar, Completar huecos (en
    sprints siguientes).

Este repositorio contiene la base completa del sistema: autenticación,
internacionalización y la arquitectura base para escalar.

------------------------------------------------------------------------

## 🚀 Tecnologías principales

Tecnología                    Uso
----------------------------- ----------------------------------
**Next.js (App Router)**      Framework principal del frontend
**Firebase Authentication**   Registro/login (email y Google)
**Firestore**                 Base de datos NoSQL
**TailwindCSS**               Estilos y diseño rápido
**react-hook-form**           Gestión de formularios
**Zod**                       Validación de formularios
**i18next**                   Internacionalización (ES/EN)
**Sonner**                    Sistema global de notificaciones

------------------------------------------------------------------------

# 🧱 Arquitectura del Proyecto

    src/
     ├── app/
     │    ├── (auth)/
     │    │     ├── login/
     │    │     │     └── page.tsx
     │    │     └── register/
     │    │           └── page.tsx
     │    ├── dashboard/
     │    │     ├── layout.tsx
     │    │     └── page.tsx
     │    └── layout.tsx
     │
     ├── components/
     │    ├── AuthCard.tsx
     │    └── ui/
     │         ├── Button.tsx
     │         └── Input.tsx
     │
     ├── context/
     │    └── AuthContext.tsx
     │
     ├── lib/
     │    ├── authService.ts
     │    ├── firebase.ts
     │    └── validationSchemas.ts
     │
     └── i18n/
          ├── i18n-config.ts
          ├── index.ts
          └── locales/
               ├── es/common.json
               └── en/common.json

------------------------------------------------------------------------

# 🔐 Autenticación implementada (Sprint 1)

### ✔️ Registro con email

### ✔️ Login con email

### ✔️ Login / Registro con Google

### ✔️ Guardado del usuario en Firestore

### ✔️ Persistencia de sesión con `onAuthStateChanged`

### ✔️ Rutas protegidas con `AuthGuard`

### ✔️ Dashboard solo accesible por usuarios autenticados

### ✔️ Sistema global de notificaciones (Sonner)

------------------------------------------------------------------------

# 🌍 Internacionalización (i18n)

El proyecto soporta multilenguaje mediante **i18next**.

-   Idiomas incluidos: **Español (es)** y **Inglés (en)**
-   Traducciones en `src/i18n/locales/`
-   Hook `useTranslation` integrado en formularios y dashboard

------------------------------------------------------------------------

# 🔒 Reglas de Firestore (Producción)

    rules_version = '2';

    service cloud.firestore {
      match /databases/{database}/documents {

        match /users/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }

        match /{document=**} {
          allow read, write: if false;
        }
      }
    }

------------------------------------------------------------------------

# ▶️ Puesta en marcha del proyecto

## 1️⃣ Clonar el repositorio

``` bash
git clone <tu-repo>
cd <tu-repo>
```

------------------------------------------------------------------------

## 2️⃣ Instalar dependencias

``` bash
npm install
```

------------------------------------------------------------------------

## 3️⃣ Configurar variables de entorno

Crear archivo **.env.local**:

``` env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
```

------------------------------------------------------------------------

## 4️⃣ Ejecutar en modo desarrollo

``` bash
npm run dev
```

La app estará en:

👉 http://localhost:3000

------------------------------------------------------------------------

# 🧩 Funcionalidades actuales

-   Registro de usuarios\
-   Inicio de sesión\
-   Acceso con Google\
-   Validación de formularios con Zod\
-   UI profesional con Tailwind\
-   Toaster global para mensajes\
-   Dashboard protegido\
-   Traducciones ES/EN\
-   Usuario almacenado en Firestore

------------------------------------------------------------------------

# 🎯 Siguientes pasos (Sprint 2)

-   Modelo `activities`\
-   CRUD de actividades\
-   Plantilla tipo Quiz\
-   Editor visual\
-   Listado de actividades del usuario\
-   Previsualización

------------------------------------------------------------------------

# 📜 Licencia

Proyecto en desarrollo.