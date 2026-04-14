# Documentacion Funcional - HU1 y HU2

## Alcance
Este documento resume el valor funcional entregado en:

- HU-01: Disponibilidad y coherencia de la informacion
- HU-02: Sesion estable y control de acceso

## HU-01 - Disponibilidad y coherencia de la informacion

### Problema funcional que resuelve
Antes de HU-01, la informacion financiera podia cargar de forma inconsistente o con logica dispersa en pantallas. HU-01 centraliza la carga de datos para que el estudiante vea informacion coherente en toda la app.

### Resultado funcional esperado

- El usuario autenticado ve sus datos financieros de forma consistente.
- Dashboard y transacciones usan la misma fuente de estado.
- La app mantiene estados de carga y error controlados.
- No se muestran datos de otros usuarios.

### Criterios funcionales cumplidos

- Carga inicial centralizada de categorias, transacciones y presupuestos.
- Consulta de datos filtrada por usuario autenticado.
- Recalculo de totales (ingresos, gastos, balance) ante cambios.
- Actualizaciones visibles sin recargar manualmente toda la app.

### Flujo funcional (HU-01)

1. El usuario inicia sesion.
2. La app dispara la carga inicial de datos.
3. Se muestran indicadores de carga mientras se obtiene informacion.
4. Al finalizar, dashboard y modulos consumen el mismo estado global.
5. Si hay error, se informa sin romper toda la experiencia.

## HU-02 - Sesion estable y control de acceso

### Problema funcional que resuelve
Antes de HU-02, al recargar o navegar podia perderse contexto de sesion o permitir accesos incorrectos. HU-02 endurece autenticacion y navegacion.

### Resultado funcional esperado

- La sesion persiste al recargar la aplicacion.
- Si no hay sesion valida, se redirige a login.
- El logout cierra sesion y limpia estado sensible.
- El usuario no puede volver a vistas privadas con el boton atras.

### Criterios funcionales cumplidos

- Recuperacion de sesion en arranque.
- Escucha de cambios de autenticacion para mantener sincronia.
- Proteccion de rutas privadas.
- Redireccion con replace en flujos de login/registro/logout.

### Flujo funcional (HU-02)

1. Usuario entra a la app.
2. Se valida sesion activa.
3. Si es valida, accede a rutas privadas.
4. Si no es valida, va a login.
5. Al cerrar sesion, la app limpia estado y bloquea rutas privadas.

## Impacto para usuario final

- Menos errores de consistencia en datos.
- Mayor confianza en cifras mostradas.
- Experiencia de acceso mas predecible y segura.
- Menor friccion al usar la app en recargas o cambios de ruta.
