-- ============================================================
-- MIGRACIÓN 003: Sistema de Logros
-- HU-09 — Crear sistema completo de logros
-- ============================================================

-- TABLA: catalogo_logros (catálogo global, público, solo lectura)
CREATE TABLE IF NOT EXISTS public.catalogo_logros (
  id text NOT NULL,
  nombre text NOT NULL,
  descripcion text NOT NULL,
  icono text,
  categoria text NOT NULL CHECK (categoria IN ('gasto', 'ahorro', 'presupuesto', 'disciplina', 'maestria', 'especial')),
  tipo text NOT NULL CHECK (tipo IN ('contador', 'umbral', 'racha', 'porcentaje', 'hito')),
  meta integer NOT NULL CHECK (meta > 0),
  activo boolean NOT NULL DEFAULT true,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT catalogo_logros_pkey PRIMARY KEY (id)
);

-- TABLA: progreso_logros (progreso por usuario autenticado)
CREATE TABLE IF NOT EXISTS public.progreso_logros (
  id bigserial NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logro_id text NOT NULL REFERENCES public.catalogo_logros(id) ON DELETE CASCADE,
  avance_actual integer NOT NULL DEFAULT 0,
  porcentaje numeric NOT NULL DEFAULT 0,
  desbloqueado boolean NOT NULL DEFAULT false,
  fecha_desbloqueo timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT progreso_logros_pkey PRIMARY KEY (id),
  CONSTRAINT progreso_logros_usuario_logro_key UNIQUE (user_id, logro_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_progreso_logros_user_id ON public.progreso_logros (user_id);
CREATE INDEX IF NOT EXISTS idx_progreso_logros_user_desbloqueado ON public.progreso_logros (user_id, desbloqueado);
CREATE INDEX IF NOT EXISTS idx_catalogo_logros_categoria ON public.catalogo_logros (categoria);
CREATE INDEX IF NOT EXISTS idx_catalogo_logros_activo ON public.catalogo_logros (activo);

-- RLS para catalogo_logros: todos pueden leer, nadie modifica desde el cliente
ALTER TABLE public.catalogo_logros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalogo_logros_select_all" ON public.catalogo_logros;
CREATE POLICY "catalogo_logros_select_all" ON public.catalogo_logros
  FOR SELECT USING (true);

-- RLS para progreso_logros: cada usuario solo accede a lo suyo
ALTER TABLE public.progreso_logros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "progreso_logros_select" ON public.progreso_logros;
CREATE POLICY "progreso_logros_select" ON public.progreso_logros
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "progreso_logros_insert" ON public.progreso_logros;
CREATE POLICY "progreso_logros_insert" ON public.progreso_logros
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "progreso_logros_update" ON public.progreso_logros;
CREATE POLICY "progreso_logros_update" ON public.progreso_logros
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "progreso_logros_delete" ON public.progreso_logros;
CREATE POLICY "progreso_logros_delete" ON public.progreso_logros
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SEED: Catálogo inicial de 24 logros
-- ============================================================

INSERT INTO public.catalogo_logros (id, nombre, descripcion, icono, categoria, tipo, meta, orden) VALUES
  -- 🔥 Categoría: Gasto
  ('el-gaston',            'El Gastón',                'Registra tu primer gasto',                                       '💸', 'gasto',        'hito',       1,    1),
  ('comprador-serial',     'Comprador Serial',         'Registra 25 gastos en total',                                    '🛒', 'gasto',        'contador',   25,   2),
  ('billetera-rota',       'Billetera Rota',           'Registra 100 gastos en total',                                   '💔', 'gasto',        'contador',   100,  3),
  ('gasto-hormiga-hunter', 'Cazador de Gastos Hormiga','Registra 10 gastos menores a $5,000',                            '🐜', 'gasto',        'contador',   10,   4),
  ('big-spender',          'Big Spender',              'Registra un gasto mayor a $500,000',                             '🤑', 'gasto',        'umbral',     1,    5),

  -- 💰 Categoría: Ahorro
  ('primer-ingreso',       'Mi Primer Ingreso',        'Registra tu primer ingreso',                                     '🌱', 'ahorro',       'hito',       1,    6),
  ('ahorrativo',           'El Ahorrativo',            'Mantén un balance positivo con al menos 10 transacciones',       '🐷', 'ahorro',       'umbral',     10,   7),
  ('colchon-financiero',   'Colchón Financiero',       'Alcanza un balance positivo mayor a $1,000,000',                 '🛏️', 'ahorro',       'umbral',     1,    8),
  ('ingresos-estables',    'Ingresos Estables',        'Registra 20 ingresos en total',                                  '📈', 'ahorro',       'contador',   20,   9),
  ('millonario-estudiantil','Millonario Estudiantil',   'Acumula $5,000,000 en ingresos totales',                         '💎', 'ahorro',       'umbral',     1,    10),

  -- 📊 Categoría: Presupuesto
  ('primer-presupuesto',   'Mi Primer Presupuesto',    'Crea tu primer presupuesto',                                     '📋', 'presupuesto',  'hito',       1,    11),
  ('planificador',         'El Planificador',          'Crea 5 presupuestos en diferentes categorías',                   '🗂️', 'presupuesto',  'contador',   5,    12),
  ('guardian-del-limite',  'Guardián del Límite',      'Termina un mes sin exceder ningún presupuesto',                  '🛡️', 'presupuesto',  'hito',       1,    13),
  ('presupuesto-perfecto', 'Presupuesto Perfecto',     'Gasta entre el 80% y 100% de un presupuesto sin pasarte',       '✨', 'presupuesto',  'hito',       1,    14),
  ('multi-presupuesto',    'Multi-Presupuesto',        'Ten 3 o más presupuestos activos en el mismo mes',               '🎯', 'presupuesto',  'umbral',     3,    15),

  -- 📝 Categoría: Disciplina
  ('primera-transaccion',  'Primera Transacción',      'Registra tu primera transacción (ingreso o gasto)',              '🎉', 'disciplina',   'hito',       1,    16),
  ('registro-diligente',   'Registro Diligente',       'Registra 50 transacciones en total',                             '📝', 'disciplina',   'contador',   50,   17),
  ('centurion',            'Centurión',                'Alcanza las 100 transacciones registradas',                       '🏛️', 'disciplina',   'contador',   100,  18),
  ('organizador-nato',     'Organizador Nato',         'Usa al menos 5 categorías diferentes en tus gastos',             '🗃️', 'disciplina',   'contador',   5,    19),
  ('diversificador',       'Diversificador',           'Registra ingresos en 3 o más categorías diferentes',             '🌈', 'disciplina',   'contador',   3,    20),

  -- 🏆 Categoría: Maestría
  ('sensei-financiero',    'Sensei Financiero',        'Desbloquea 10 logros diferentes',                                '🥋', 'maestria',     'contador',   10,   21),
  ('equilibrista',         'Equilibrista',             'Mantén gastos ≤ 60% de tus ingresos con al menos 20 transacciones','⚖️','maestria',    'porcentaje', 60,   22),
  ('master-categorias',    'Máster de Categorías',     'Crea 3 categorías personalizadas',                               '🎨', 'maestria',     'contador',   3,    23),

  -- 🌟 Categoría: Especial
  ('madrugador',           'Madrugador',               'Registra una transacción antes de las 7:00 AM',                  '🌅', 'especial',     'hito',       1,    24),
  ('noctambulo',           'Noctámbulo',               'Registra una transacción después de las 11:00 PM',               '🦉', 'especial',     'hito',       1,    25)
ON CONFLICT (id) DO NOTHING;
