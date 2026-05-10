-- Agregar campos de contexto académico a la tabla perfiles
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS semestre_actual text,
  ADD COLUMN IF NOT EXISTS meta_grado integer,
  ADD COLUMN IF NOT EXISTS estado_academico text DEFAULT 'Activo';

-- Validar valores permitidos
ALTER TABLE public.perfiles
  ADD CONSTRAINT perfiles_estado_academico_check
  CHECK (estado_academico IN ('Activo', 'Pausado', 'Egresado'));