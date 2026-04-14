# Diagrama ER - FinanzasU

## Objetivo

Este documento presenta el modelo entidad-relacion (ER) actual de la base de datos de FinanzasU,
alineado con los scripts SQL de migracion y politicas RLS.

## Diagrama entidad-relacion

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
    }

    PERFILES {
        uuid id PK
        text nombre
        text email
        text avatar_url
        timestamptz created_at
    }

    CATEGORIAS {
        bigint id PK
        text nombre
        text icono
        text color
        text tipo
        uuid user_id FK
        boolean es_predeterminada
        timestamptz created_at
    }

    TRANSACCIONES {
        bigint id PK
        uuid user_id FK
        text tipo
        numeric monto
        text descripcion
        bigint categoria_id FK
        date fecha
        timestamptz created_at
    }

    PRESUPUESTOS {
        bigint id PK
        uuid user_id FK
        bigint categoria_id FK
        numeric monto_limite
        int mes
        int anio
        timestamptz created_at
    }

    AUTH_USERS ||--|| PERFILES : "1 a 1"
    AUTH_USERS ||--o{ CATEGORIAS : "1 a N (solo personalizadas)"
    AUTH_USERS ||--o{ TRANSACCIONES : "1 a N"
    AUTH_USERS ||--o{ PRESUPUESTOS : "1 a N"

    CATEGORIAS ||--o{ TRANSACCIONES : "1 a N"
    CATEGORIAS ||--o{ PRESUPUESTOS : "1 a N"
```

## Reglas de negocio clave

- Categorias globales del sistema:
  - `categorias.user_id IS NULL`
  - `categorias.es_predeterminada = true`
- Categorias personalizadas:
  - `categorias.user_id = auth.uid()`
- Presupuesto unico por periodo:
  - `UNIQUE (user_id, categoria_id, mes, anio)`
- Validaciones de integridad:
  - `transacciones.monto > 0`
  - `presupuestos.monto_limite > 0`
  - `presupuestos.mes BETWEEN 1 AND 12`

## Comportamiento de claves foraneas

- `perfiles.id -> auth.users.id` con `ON DELETE CASCADE`
- `categorias.user_id -> auth.users.id` con `ON DELETE CASCADE`
- `transacciones.user_id -> auth.users.id` con `ON DELETE CASCADE`
- `transacciones.categoria_id -> categorias.id` con `ON DELETE SET NULL`
- `presupuestos.user_id -> auth.users.id` con `ON DELETE CASCADE`
- `presupuestos.categoria_id -> categorias.id` con `ON DELETE CASCADE`

## Seguridad (RLS)

RLS esta habilitado en:

- `public.perfiles`
- `public.categorias`
- `public.transacciones`
- `public.presupuestos`

Principio aplicado:

- Cada usuario solo puede operar sobre sus propios datos.
- En categorias, lectura combinada de categorias propias + categorias globales.

## Fuente tecnica

Este diagrama se deriva de:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/policies.sql`
