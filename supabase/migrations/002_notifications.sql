-- TABLA: notificaciones
CREATE TABLE public.notificaciones (
  id bigserial NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('transaccion', 'presupuesto', 'logro', 'sistema')),
  titulo text NOT NULL,
  mensaje text NOT NULL,
  modulo_origen text NOT NULL,
  leida boolean NOT NULL DEFAULT false,
  ruta_destino text,
  recurso_tipo text,
  recurso_id text,
  event_key text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_notificaciones_user_leida_created
  ON public.notificaciones (user_id, leida, created_at DESC);

CREATE INDEX idx_notificaciones_event_key
  ON public.notificaciones (user_id, event_key, created_at DESC)
  WHERE event_key IS NOT NULL;

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificaciones_select" ON public.notificaciones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notificaciones_insert" ON public.notificaciones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notificaciones_update" ON public.notificaciones
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notificaciones_delete" ON public.notificaciones
  FOR DELETE USING (auth.uid() = user_id);