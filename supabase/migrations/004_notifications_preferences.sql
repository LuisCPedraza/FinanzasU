-- TABLA: preferencias_notificacion
CREATE TABLE public.preferencias_notificacion (
  id bigserial NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alertas_diarias boolean NOT NULL DEFAULT true,
  resumen_semanal boolean NOT NULL DEFAULT true,
  novedades_sistema boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT preferencias_notificacion_pkey PRIMARY KEY (id),
  CONSTRAINT preferencias_notificacion_user_unique UNIQUE (user_id)
);

ALTER TABLE public.preferencias_notificacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prefs_select" ON public.preferencias_notificacion
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "prefs_insert" ON public.preferencias_notificacion
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prefs_update" ON public.preferencias_notificacion
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);