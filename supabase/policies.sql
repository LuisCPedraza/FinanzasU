-- Activar RLS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada usuario solo ve y edita el suyo
CREATE POLICY "perfil_select" ON public.perfiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "perfil_insert" ON public.perfiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "perfil_update" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "perfil_delete" ON public.perfiles
  FOR DELETE USING (auth.uid() = id);

-- Categorías: las suyas + las predeterminadas del sistema (user_id IS NULL)
CREATE POLICY "categorias_select" ON public.categorias
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "categorias_insert_propias" ON public.categorias
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "categorias_update_propias" ON public.categorias
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "categorias_delete_propias" ON public.categorias
  FOR DELETE USING (user_id = auth.uid());

-- Transacciones: solo las suyas
CREATE POLICY "transacciones_select" ON public.transacciones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transacciones_insert" ON public.transacciones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transacciones_update" ON public.transacciones
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transacciones_delete" ON public.transacciones
  FOR DELETE USING (auth.uid() = user_id);

-- Presupuestos: solo los suyos
CREATE POLICY "presupuestos_select" ON public.presupuestos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "presupuestos_insert" ON public.presupuestos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "presupuestos_update" ON public.presupuestos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "presupuestos_delete" ON public.presupuestos
  FOR DELETE USING (auth.uid() = user_id);