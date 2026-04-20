# HU-13 - Sistema de notificaciones

## Objetivo
Implementar notificaciones internas por usuario autenticado, visibles desde el header compartido en todos los modulos protegidos.

## Modelo de datos
Tabla: `public.notificaciones`

Campos principales:
- `id`
- `user_id`
- `tipo`: `transaccion | presupuesto | logro | sistema`
- `titulo`
- `mensaje`
- `modulo_origen`
- `leida`
- `created_at`
- `ruta_destino` (opcional)
- `recurso_tipo` y `recurso_id` (referencia opcional)
- `event_key` (deduplicacion)

## Reglas iniciales de generacion
1. Transaccion registrada:
- Se crea una notificacion cuando el usuario registra una transaccion.
- `event_key`: `transaccion-{id}`
- No se duplica porque el identificador de transaccion es unico.

2. Presupuesto excedido:
- Se evalua automaticamente al crear o actualizar una transaccion de gasto.
- Si el gasto acumulado del periodo (mes/anio) supera el `monto_limite`, se crea notificacion.
- `event_key`: `presupuesto-excedido-{presupuestoId}-{anio}-{mes}`
- Se evita duplicado del mismo presupuesto/periodo.

3. Logro alcanzado:
- El servicio contempla una operacion para registrar notificacion de logro desbloqueado.
- `event_key`: `logro-{logroId}`
- Permite integracion directa con el sistema de logros (HU-09/HU-10).

## Operaciones del servicio
- Listar notificaciones del usuario autenticado.
- Contar notificaciones no leidas.
- Marcar una notificacion como leida.
- Marcar todas como leidas.
- Crear notificacion con deduplicacion por `event_key`.

## Comportamiento en UI
- Campana en header compartido (todos los modulos protegidos).
- Contador de no leidas en tiempo de ejecucion sin recargar.
- Panel con estados de carga, vacio y error (copys en espanol).
- Click en notificacion:
  - marca como leida
  - redirige a `ruta_destino` cuando exista

## Seguridad
- RLS activa en `public.notificaciones`.
- Politicas CRUD limitadas al propietario: `auth.uid() = user_id`.
- Aislamiento por usuario garantizado.
