# Trazabilidad - HU1 y HU2

## Matriz HU -> Implementacion -> Verificacion

| HU | Objetivo | Implementacion clave | Evidencia tecnica | Resultado |
|---|---|---|---|---|
| HU-01 | Coherencia y disponibilidad de informacion | Carga inicial centralizada + hooks de dominio + services por modulo | `src/context/AppDataContext.jsx`, `src/hooks/useInitialData.js`, `src/hooks/useCategorias.js`, `src/hooks/useTransacciones.js`, `src/hooks/usePresupuestos.js`, `src/services/categoriasService.js`, `src/services/transaccionesService.js`, `src/services/presupuestosService.js` | Cumplida |
| HU-02 | Sesion estable y control de acceso | Persistencia de sesion + rutas protegidas + redireccion y limpieza de estado | `src/context/AuthContext.jsx`, `src/hooks/useAuth.js`, `src/components/layout/ProtectedRoute.jsx`, `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/services/supabaseClient.js` | Cumplida |

## Mapeo de criterios de aceptacion

### HU-01

- Criterio: Carga inicial coherente de informacion.
  - Implementado en: `src/context/AppDataContext.jsx`.
- Criterio: Sin consultas directas desde pages.
  - Implementado en: hooks y services de dominio.
- Criterio: Filtrado por usuario autenticado.
  - Implementado en: services con condicion por usuario.
- Criterio: Estado de carga/error centralizado.
  - Implementado en: AppDataContext.

### HU-02

- Criterio: Persistencia de sesion al recargar.
  - Implementado en: `src/context/AuthContext.jsx`.
- Criterio: Bloqueo de rutas privadas sin sesion.
  - Implementado en: `src/components/layout/ProtectedRoute.jsx`.
- Criterio: Logout con limpieza de estado.
  - Implementado en: capa de auth + limpieza en estado global.
- Criterio: Evitar retroceso a vistas privadas.
  - Implementado en: redirecciones con `replace`.

## Artefactos de soporte

- Documento principal de estado: `README.md`.
- Modelo de datos relacionado: `docs/diagrama-er.md`.
- Esquema y seguridad: `supabase/migrations/001_initial_schema.sql`, `supabase/policies.sql`, `supabase/seed.sql`.

## Sugerencia de uso en PR o entrega

1. Adjuntar este archivo en la descripcion del PR.
2. Referenciar pruebas manuales ejecutadas (login, recarga, logout, rutas protegidas).
3. Adjuntar capturas de dashboard/transacciones y flujo de acceso.
