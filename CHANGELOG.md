# Changelog

## [1.0.1] - 2026-07-15

### Fixed

- Usar `dvh` en vez de `vh` para viewport height en iOS PWA standalone (tab bar cortada)
- Agregar `safe-area-bottom` a contenedores de formularios (botón Submit tapado por home indicator)
- Agregar `inputmode`, `autocorrect` y `autocapitalize` a campos de formulario (teclado y corrección iOS)
- Agregar GPU layer (`translateZ(0)`) a tab-bar-mobile para evitar jitter en scroll iOS
- Corregir FABs separando `position: fixed` de `transform` (bug conocido de iOS Safari)
- Corregir clipping de iconos en tab-bar con `overflow: visible` en iOS
- Corregir tap passthrough en overlay de calendario con `bg-transparent cursor-pointer`
- Agregar `apple-mobile-web-app-capable` y `theme-color` para modo oscuro al manifest
- Apilar botones de confirm-dialog verticalmente para evitar overflow en iOS
- Agregar `translateZ(0)` a `.sticky` global para corregir flickering de `backdrop-blur` en iOS

## [1.0.0] - 2026-07-01

### Added

- Versión inicial: dashboard, gestión de miembros, pagos, membresías y usuarios
- PWA con soporte standalone en Android e iOS
- Tema claro/oscuro/sistema
- Autenticación con JWT
