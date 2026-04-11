# FinanzasU

Aplicacion web para gestionar finanzas personales de estudiantes, construida con React + Vite y Supabase.

## Estado de Historias de Usuario (Checklist)

Actualizado: 2026-04-10

- [x] HU-01 - Disponibilidad y coherencia de mi informacion
  - [x] AuthContext + hooks de carga inicial
  - [x] Services de categorias, transacciones y presupuestos
  - [x] Estado global de carga/error
  - [x] Consultas filtradas por usuario autenticado
  - [x] Sin consultas directas desde pages (usa hooks/services)

- [x] HU-02 - Sesion estable y control de acceso
  - [x] Persistencia de sesion al recargar app
  - [x] Redireccion a login cuando no hay sesion valida
  - [x] Logout con limpieza de estado sensible
  - [x] Navegacion endurecida con replace para evitar regresar a vistas privadas

- [ ] HU-03 - Perfil (pendiente)
- [ ] HU-04 - Categorias (pendiente)
- [ ] HU-05 - Presupuestos (pendiente)

## Tecnologias

- React
- Vite
- React Router
- Supabase JS
- Tailwind CSS

## Estructura real del proyecto

```text
FinanzasU/
  src/
    components/
      charts/
      layout/
        Layout.jsx
        Navbar.jsx
        ProtectedRoute.jsx
      ui/
        Modal.jsx
        Spinner.jsx
    context/
      AuthContext.jsx
      AppDataContext.jsx
    hooks/
      useAuth.js
      useInitialData.js
      useCategorias.js
      useTransacciones.js
      usePresupuestos.js
    pages/
      Login.jsx
      Register.jsx
      Dashboard.jsx
      Transacciones.jsx
      Categorias.jsx
      Presupuestos.jsx
      Perfil.jsx
    services/
      supabaseClient.js
      categoriasService.js
      transaccionesService.js
      presupuestosService.js
  supabase/
    migrations/
      001_initial_schema.sql
    policies.sql
    seed.sql
```

## Diagrama de arquitectura del proyecto

```mermaid
flowchart LR
    UI[Pages y componentes React]
    AR[ProtectedRoute]
    AC[AuthContext]
    DC[AppDataContext]
    HK[Hooks por modulo]
    SV[Services Supabase]
    SA[Supabase Auth]
    DB[(Supabase PostgreSQL)]

    UI --> AR
    UI --> HK
    AR --> AC
    HK --> DC
    DC --> SV
    AC --> SA
    SV --> DB
    SA --> DB
```

## Evidencias de cumplimiento por HU

### HU-01 - Disponibilidad y coherencia

- [x] Carga inicial por contexto y hooks
- [x] Servicios por modulo sin consultas directas desde pages
- [x] Totales en dashboard reflejan nuevas transacciones
- [x] Manejo de error global sin corromper estado cargado

### HU-02 - Sesion estable y control de acceso

- [x] Sesion persistente al recargar (getSession + onAuthStateChange)
- [x] Redireccion a login cuando no hay sesion valida
- [x] Logout con limpieza de estado sensible
- [x] Navegacion con replace para evitar regreso a vistas privadas

## Trazabilidad HU -> Archivos clave

| HU | Archivos |
|---|---|
| HU-01 | src/context/AppDataContext.jsx, src/hooks/useInitialData.js, src/hooks/useCategorias.js, src/hooks/useTransacciones.js, src/hooks/usePresupuestos.js, src/services/categoriasService.js, src/services/transaccionesService.js, src/services/presupuestosService.js, src/pages/Dashboard.jsx, src/pages/Transacciones.jsx, supabase/migrations/001_initial_schema.sql, supabase/policies.sql, supabase/seed.sql |
| HU-02 | src/context/AuthContext.jsx, src/hooks/useAuth.js, src/components/layout/ProtectedRoute.jsx, src/pages/Login.jsx, src/pages/Register.jsx, src/pages/Dashboard.jsx, src/services/supabaseClient.js |

## Plantilla de actualizacion de estado (por sprint)

Usar esta plantilla en cada cierre de sprint para mantener el checklist vivo:

```md
### Sprint X - Fecha: YYYY-MM-DD

- HU-XX: [ ] pendiente / [x] cumplida
  - Criterio 1: [ ]/[x]
  - Criterio 2: [ ]/[x]
  - Evidencia: enlace PR / commit / captura

- Riesgos detectados:
  - ...

- Proximo enfoque:
  - ...
```

## Configuracion local

### 1) Instalar dependencias

```bash
npm install
```

### 2) Variables de entorno

Crear o completar el archivo .env.local en la raiz del proyecto con:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Si faltan estas variables, la app lanza error controlado desde src/services/supabaseClient.js.

### 3) Inicializar base de datos (Supabase SQL Editor)

Ejecutar en este orden:

1. supabase/migrations/001_initial_schema.sql
2. supabase/policies.sql
3. supabase/seed.sql

### 4) Levantar la aplicacion

```bash
npm run dev
```

URL local por defecto: http://localhost:5173

## Scripts disponibles

- npm run dev
- npm run build
- npm run lint
- npm run preview

## Estado tecnico actual

- Build: OK
- Lint: OK
- HU1: cumplida
- HU2: cumplida
