# 🏋️ AcGym - Sistema de Gestión de Gimnasio

<div align="center">

![Angular](https://img.shields.io/badge/Angular-22.0.6-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Taiga UI](https://img.shields.io/badge/Taiga_UI-5.14-526ED3?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjU2IDBDMTE0LjYgMCAwIDExNC42IDAgMjU2czExNC42IDI1NiAyNTYgMjU2IDI1Ni0xMTQuNiAyNTYtMjU2UzM5Ny40IDAgMjU2IDB6bTAgNDgwQzEzMi4zIDQ4MCAzMiAzNzkuNyAzMiAyNTZTMTA0LjMgMzIgMjU2IDMyczIyNCA4NC4zIDIyNCAyMjQtODQuMyAyMjQtMjI0IDIyNHoiLz48L3N2Zz4=)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

Sistema web moderno para la administración integral de gimnasios, desarrollado con Angular 22, Taiga UI 5 y las últimas tecnologías web.

[Reportar Bug](https://github.com/HumeLop/acgym/issues) · [Solicitar Feature](https://github.com/HumeLop/acgym/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Descripcion](#-descripcion)
- [Caracteristicas](#-caracteristicas)
- [Tecnologias](-tecnologias)
- [Arquitectura](-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Backend](#-api-backend)
- [Configuracion](-configuracion)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 Descripcion

**AcGym** es una aplicación SPA (Single Page Application) diseñada para la gestión completa de gimnasios. Ofrece una interfaz moderna, mobile-first y con soporte PWA para administrar miembros, pagos, tipos de membresía y usuarios del sistema, con roles diferenciados (admin/recepcionista).

### Funcionalidades Principales

- **Dashboard Interactivo**: Métricas en tiempo real, gráficos de ingresos y métodos de pago (admin)
- **Gestión de Miembros**: CRUD completo, seguimiento de membresías activas y vencidas, búsqueda de inactivos
- **Control de Pagos**: Registro con múltiples métodos (efectivo, tarjeta, transferencia), fechas de inicio/vencimiento
- **Tipos de Membresía**: Administración de planes, precios y duración
- **Panel de Administración**: Gestión de usuarios del sistema y control de accesos
- **Autenticación Segura**: Login JWT con guards, interceptor de tokens y roles

---

## ✨ Caracteristicas

### 🔐 Autenticación y Seguridad

- Sistema de login con JWT (JSON Web Tokens)
- Interceptor HTTP para inyección automática de token
- `authGuard` protege todas las rutas, `adminGuard` restringe admin solo al rol admin
- `loginGuard` redirige usuarios autenticados al dashboard
- Logout con confirmación y limpieza de sesión

### 👥 Gestión de Miembros

- CRUD completo con modales responsivos (TuiResponsiveDialog)
- Estado visual de membresía (activa, por vencer, vencida, sin membresía)
- Historial de pagos por miembro en vista de detalle
- Búsqueda de miembros inactivos por días desde el dashboard

### 💰 Control de Pagos

- Registro con métodos: Efectivo, Tarjeta, Transferencia
- Seguimiento de fechas de inicio y vencimiento
- Dashboard de pagos con estadísticas por método de pago
- Búsqueda de miembros al crear/editar pagos
- Historial de pagos en detalle de miembro

### 📊 Dashboard

- Stats cards con totales (miembros activos, próximos vencimientos — pagos e ingresos visibles solo admin)
- Gráfico de barras de ingresos mensuales últimos 6 meses (solo admin)
- Gráfico de anillo de métodos de pago (solo admin)
- Búsqueda de miembros inactivos por días

### 🎨 UI/UX Moderna

- Mobile-first con Tailwind CSS 4 y Taiga UI 5
- Tema claro/oscuro/sistema con `ThemeService`
- Soporte PWA con service worker y modo offline
- Animaciones con view transitions y `animate-fade-in-up`
- Haptic feedback en interacciones táctiles
- Pull-to-refresh en todas las listas y detalles

---

## 🛠️ Tecnologias

### Core

- **[Angular 22](https://angular.dev/)** — Framework zoneless, standalone components, signal-based
- **[TypeScript 6.x](https://www.typescriptlang.org/)** — Lenguaje tipado
- **[pnpm](https://pnpm.io/)** — Package manager rápido y eficiente

### UI/UX

- **[Taiga UI 5.x](https://taiga-ui.dev/)** — Librería de componentes (core, kit, layout, addon-mobile, addon-charts)
- **[Tailwind CSS 4.x](https://tailwindcss.com/)** — CSS utility-first con CSS variables y dark mode
- **[date-fns v4](https://date-fns.org/)** — Manipulación de fechas con soporte de timezone (`@date-fns/tz`)

### Herramientas

- **[Biome 2.5](https://biomejs.dev/)** — Linter y formatter para TypeScript y CSS
- **[Prettier](https://prettier.io/)** — Formateo de archivos HTML
- **[Vitest](https://vitest.dev/)** — Test runner unitario

---

## 🏗️ Arquitectura

### Patrón de Diseño

El proyecto sigue una **arquitectura modular por features** con estas capas:

```text
┌─────────────────────────────────────────┐
│              Páginas / Componentes      │
│         (UI con signals + templates)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│             Servicios (@Service)        │
│     (Lógica de negocio, estado, API)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│           Adaptadores + Modelos         │
│   (entity → model, DTOs, enums)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Guards / Interceptors            │
│    (auth, admin, token, timeout)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│           API Backend (DRF)             │
│      Django REST Framework /api/        │
└─────────────────────────────────────────┘
```

### Principios Clave

- **Zoneless Change Detection** — Sin Zone.js, detección basada en señales
- **Signal-based State** — `signal()`, `computed()`, `linkedSignal()`, `effect()` para estado reactivo
- **httpResource** — Todas las peticiones GET son declarativas y signal-based
- **Servicios privados** — Inyectados como `private`, expuestos al template vía propiedades/métodos `protected`
- **Lazy Loading** — Cada feature se carga bajo demanda (`loadChildren` / `loadComponent`)
- **Mobile-first** — Diseño responsivo con pull-to-refresh, swipe actions, responsive dialogs
- **PWA Ready** — Service worker, manifiesto, instalable en dispositivos

---

## 📦 Requisitos Previos

- **Node.js** >= 18.19.0 o >= 20.11.0
- **pnpm** >= 11.x
- **Git** >= 2.x

```bash
node --version
pnpm --version
git --version
```

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/HumeLop/acgym.git
cd acgym/frontend/acgym
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea `src/environments/environment.ts` a partir del template:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api',
}
```

### 4. Iniciar el servidor de desarrollo

```bash
pnpm start
```

La aplicación estará disponible en `http://localhost:4200/`.

---

## 💻 Uso

### Flujo de Usuario

1. **Login** — Ingresa con tus credenciales (usuario/contraseña)
2. **Dashboard** — Panel principal con métricas y accesos rápidos
3. **Miembros** — Lista, búsqueda, creación y edición de socios
4. **Pagos** — Registro y consulta de pagos con dashboard de estadísticas
5. **Admin** (solo admin) — Gestión de usuarios y tipos de membresía

### Roles

| Rol           | Dashboard stats | Miembros | Pagos | Admin |
| ------------- | :-------------: | :------: | :---: | :---: |
| Admin         |    Completo     |   CRUD   | CRUD  | CRUD  |
| Recepcionista |    Limitado     |   CRUD   | CRUD  |   —   |

---

## 📜 Scripts Disponibles

| Script  | Comando       | Descripción                                   |
| ------- | ------------- | --------------------------------------------- |
| Iniciar | `pnpm start`  | Dev server en `http://localhost:4200`         |
| Build   | `pnpm build`  | Build de producción en `/dist`                |
| Watch   | `pnpm watch`  | Build continuo en modo desarrollo             |
| Test    | `pnpm test`   | Ejecuta tests con Vitest                      |
| Lint    | `pnpm lint`   | Linting con Biome (TS/CSS)                    |
| Format  | `pnpm format` | Formateo con Biome (TS/CSS) + Prettier (HTML) |

---

## 📁 Estructura del Proyecto

```text
src/
├── app/
│   ├── core/                     # Layout, services globales, guards, interceptors
│   │   ├── guards/               # auth-guard, admin-guard, login-guard
│   │   ├── interceptors/         # auth.interceptor, timeout.interceptor
│   │   ├── layout/shell/         # Shell (sidebar, header, tab-bar)
│   │   └── services/             # ThemeService
│   │
│   ├── features/                 # Features lazy-loaded
│   │   ├── auth/                 # Login, AuthService, guards, interceptor
│   │   │   ├── adapters/
│   │   │   ├── models/           # entity, model, dto
│   │   │   ├── pages/login/
│   │   │   ├── services/         # AuthService
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── dashboard/            # Dashboard principal
│   │   │   ├── adapters/
│   │   │   ├── models/
│   │   │   ├── pages/            # dashboard, stats-card, stat-chart
│   │   │   └── services/         # DashboardService
│   │   │
│   │   ├── members/              # Gestión de miembros
│   │   │   ├── adapters/
│   │   │   ├── models/           # entity, model, dto, enums
│   │   │   ├── pages/            # members-list, member-card, member-details, member-form
│   │   │   ├── services/         # MemberService
│   │   │   └── members.routes.ts
│   │   │
│   │   ├── payments/             # Gestión de pagos
│   │   │   ├── adapters/
│   │   │   ├── models/           # entity, model, dto, enums
│   │   │   ├── pages/            # payments-list, payment-card, payment-details, payment-form, payment-dashboard
│   │   │   ├── services/         # PaymentService
│   │   │   └── payments.routes.ts
│   │   │
│   │   └── admin/                # Panel de administración (solo admin)
│   │       ├── pages/            # admin-dashboard, users/*, membership-type/*
│   │       ├── services/         # UserService, MembershipTypeService
│   │       └── admin.routes.ts
│   │
│   ├── shared/                   # Recursos compartidos
│   │   ├── components/           # ConfirmService + confirm dialog
│   │   ├── models/               # Enums compartidos, pagination types
│   │   └── utils/                # DateUtils, haptic feedback
│   │
│   ├── app.config.ts             # Config: zoneless, httpClient, router, Taiga, PWA
│   ├── app.routes.ts             # Rutas raíz con guards
│   └── app.ts                    # Componente raíz con TuiRoot
│
├── environments/                 # environment.ts (gitignored, template disponible)
├── styles.css                    # Tailwind CSS 4 + design tokens + fuentes
└── index.html
```

---

## 🔌 API Backend

### Endpoint Base

```text
http://127.0.0.1:8000/api
```

### Autenticación

| Método | Endpoint          | Descripción          |
| ------ | ----------------- | -------------------- |
| POST   | `/login/`         | Iniciar sesión (JWT) |
| POST   | `/token/refresh/` | Renovar access token |

### Miembros

| Método | Endpoint        | Descripción     |
| ------ | --------------- | --------------- |
| GET    | `/members/`     | Listar miembros |
| POST   | `/members/`     | Crear miembro   |
| GET    | `/members/:id/` | Detalle miembro |
| PUT    | `/members/:id/` | Actualizar      |
| DELETE | `/members/:id/` | Eliminar        |

### Pagos

| Método | Endpoint         | Descripción  |
| ------ | ---------------- | ------------ |
| GET    | `/payments/`     | Listar pagos |
| POST   | `/payments/`     | Crear pago   |
| GET    | `/payments/:id/` | Detalle pago |
| PUT    | `/payments/:id/` | Actualizar   |
| DELETE | `/payments/:id/` | Eliminar     |

### Tipos de Membresía (admin)

| Método | Endpoint                 | Descripción |
| ------ | ------------------------ | ----------- |
| GET    | `/membership-types/`     | Listar      |
| POST   | `/membership-types/`     | Crear       |
| GET    | `/membership-types/:id/` | Detalle     |
| PUT    | `/membership-types/:id/` | Actualizar  |
| DELETE | `/membership-types/:id/` | Eliminar    |

### Usuarios (admin)

| Método | Endpoint           | Descripción |
| ------ | ------------------ | ----------- |
| GET    | `/users/`          | Listar      |
| POST   | `/users/register/` | Crear       |
| GET    | `/users/:id/`      | Detalle     |
| PUT    | `/users/:id/`      | Actualizar  |
| DELETE | `/users/:id/`      | Eliminar    |

### Dashboard

| Método | Endpoint             | Descripción                           |
| ------ | -------------------- | ------------------------------------- |
| GET    | `/dashboard/stats/`  | Estadísticas generales                |
| GET    | `/members/inactive/` | Buscar miembros inactivos (`?days=` ) |

---

## ⚙️ Configuracion

### Tailwind CSS 4

Tailwind se importa directamente en `styles.css` usando `@import 'tailwindcss'`. El dark mode usa `@custom-variant dark` y los colores referencian design tokens CSS (`--tui-*`, `--acgym-*`).

### Theme Tokens

Todos los tokens de diseño están definidos en `styles.css`: colores de sección (`--acgym-section-*`), fondos, textos y bordes. Los componentes nunca hardcodean colores.

### Biome

Configuración en `biome.json`:

- Sin punto y coma
- Comillas simples
- 2 espacios de indentación
- Trailing commas `es5`
- `import type` obligatorio para type-only imports

---

## 🧪 Testing

```bash
pnpm test
```

Usa Vitest con el builder `@angular/build:unit-test`. Los tests se ubican junto a su componente con extensión `.spec.ts`.

---

## 🚢 Despliegue

### Build de Producción

```bash
pnpm build
```

Los archivos compilados se generan en `dist/acgym/`.

### PWA

El build de producción incluye service worker (`ngsw-worker.js`) para soporte offline e instalación como app.

---

## 🤝 Contribuir

1. **Fork** el proyecto
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commit con convenciones: `feat:`, `fix:`, `refactor:`, `style:`, `test:`, `chore:`
4. Push: `git push origin feature/nueva-feature`
5. Abre un **Pull Request**

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

---

## 👤 Autor

### HumeLop

- GitHub: [@HumeLop](https://github.com/HumeLop)
- Proyecto: [AcGym](https://github.com/HumeLop/acgym)

---

### ⭐ Si te gusta este proyecto, considera darle una estrella en GitHub ⭐

Hecho con ❤️ por el equipo de AcGym
