# Documentacion Tecnica - HU1 y HU2

## Objetivo tecnico
Estandarizar arquitectura de datos y autenticacion para mejorar mantenibilidad, seguridad y coherencia de UI.

## Arquitectura aplicada

Patron principal:

- UI (pages/components)
- Hooks de dominio
- Contexts (Auth y AppData)
- Services (acceso a Supabase)

Beneficios del patron:

- Separacion de responsabilidades.
- Reutilizacion de logica.
- Menor acoplamiento de pages con infraestructura.
- Base estable para HU posteriores.

## HU-01 - Implementacion tecnica

### Componentes clave

- `src/context/AppDataContext.jsx`
- `src/hooks/useInitialData.js`
- `src/hooks/useCategorias.js`
- `src/hooks/useTransacciones.js`
- `src/hooks/usePresupuestos.js`
- `src/services/categoriasService.js`
- `src/services/transaccionesService.js`
- `src/services/presupuestosService.js`

### Decisiones tecnicas

- Centralizar carga inicial en contexto para evitar consultas duplicadas por pagina.
- Exponer solo API de dominio por hooks (no SQL directo en UI).
- Mantener estados de `cargando` y `error` en capa central.
- Filtrar por `user_id` en services para aislamiento multiusuario.

### Consideraciones de datos

- Integracion con RLS en Supabase.
- Consumo de esquema definido en migraciones/policies/seed.
- Recalculo de agregados (totales) a partir de transacciones.

## HU-02 - Implementacion tecnica

### Componentes clave

- `src/context/AuthContext.jsx`
- `src/hooks/useAuth.js`
- `src/components/layout/ProtectedRoute.jsx`
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/services/supabaseClient.js`

### Decisiones tecnicas

- Recuperar sesion inicial y suscribirse a cambios de auth.
- Encapsular operaciones de auth en `AuthContext`.
- Proteger rutas por componente de guardia (`ProtectedRoute`).
- Usar navegacion con `replace` para prevenir regreso a pantallas privadas.
- Limpiar estado sensible en logout para evitar fugas de contexto.

### Hardening aplicado

- Validacion de variables de entorno en cliente de Supabase.
- Manejo controlado de errores de autenticacion.
- Flujo de redireccion consistente en login/registro/logout.

## Resultado tecnico global (HU1 + HU2)

- Base de autenticacion y datos robusta para HU3+.
- Menor deuda tecnica por duplicacion de consultas.
- Mejor trazabilidad de errores por centralizacion de responsabilidades.
- Mejor DX para desarrollo de nuevas funcionalidades.
