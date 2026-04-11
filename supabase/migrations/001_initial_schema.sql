-- TABLA: perfiles
CREATE TABLE public.perfiles (
  id uuid NOT NULL,
  nombre text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_id_fkey FOREIGN KEY (id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- TABLA: categorias
CREATE TABLE public.categorias (
  id bigserial NOT NULL,
  nombre text NOT NULL,
  icono text,
  color text DEFAULT '#6366f1',
  tipo text NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  es_predeterminada boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);

-- TABLA: transacciones
CREATE TABLE public.transacciones (
  id bigserial NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  monto numeric NOT NULL CHECK (monto > 0),
  descripcion text,
  categoria_id bigint REFERENCES public.categorias(id) ON DELETE SET NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transacciones_pkey PRIMARY KEY (id)
);

-- TABLA: presupuestos
CREATE TABLE public.presupuestos (
  id bigserial NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria_id bigint NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  monto_limite numeric NOT NULL CHECK (monto_limite > 0),
  mes integer NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT presupuestos_pkey PRIMARY KEY (id)
);

-- Un usuario no puede tener dos presupuestos para la misma categoria en el mismo mes/anio
ALTER TABLE public.presupuestos
  ADD CONSTRAINT presupuestos_usuario_categoria_periodo_key
  UNIQUE (user_id, categoria_id, mes, anio);

-- Indices para consultas por usuario autenticado
CREATE INDEX idx_categorias_user_id ON public.categorias (user_id);
CREATE INDEX idx_transacciones_user_id_fecha ON public.transacciones (user_id, fecha DESC);
CREATE INDEX idx_presupuestos_user_id_periodo ON public.presupuestos (user_id, anio, mes);

-- Evita duplicar categorias globales y categorias personalizadas por usuario/tipo
CREATE UNIQUE INDEX uq_categorias_globales_nombre_tipo
  ON public.categorias (lower(nombre), tipo)
  WHERE user_id IS NULL;

CREATE UNIQUE INDEX uq_categorias_usuario_nombre_tipo
  ON public.categorias (user_id, lower(nombre), tipo)
  WHERE user_id IS NOT NULL;