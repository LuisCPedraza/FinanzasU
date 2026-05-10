ALTER TABLE public.presupuestos
  ADD COLUMN IF NOT EXISTS umbral_alerta_pct integer NOT NULL DEFAULT 80;

ALTER TABLE public.presupuestos
  ADD CONSTRAINT presupuestos_umbral_alerta_pct_check
  CHECK (umbral_alerta_pct BETWEEN 1 AND 100);