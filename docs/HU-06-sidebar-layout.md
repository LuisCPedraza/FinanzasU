# HU-06 - Sidebar y Layout de Navegacion

## Resumen

Se implemento una estructura de navegacion lateral reutilizable para las vistas privadas.
El objetivo fue unificar la experiencia entre Inicio, Perfil y Nueva transaccion,
incluyendo un control de contraer/expandir sidebar con una senal visual en el borde.

## Cambios principales

1. Se creo un layout lateral reutilizable con menu de navegacion y comportamiento responsive.
2. Se agrego acceso a Inicio, Perfil y Nueva transaccion desde el sidebar.
3. Se incluyo un control de contraer/expandir en el borde derecho del sidebar con estilo sutil.
4. Se adapto Dashboard para renderizar dentro del layout lateral y mantener tarjetas de resumen.
5. Se dejaron las pantallas de Perfil y Nueva transaccion como contenedores en blanco (placeholder visual).

## Archivos modificados

- src/App.jsx
- src/components/layout/Layout.jsx
- src/pages/Dashboard.jsx
- src/pages/Perfil.jsx
- src/pages/Transacciones.jsx

## Validacion tecnica

- npm run lint -> OK
- npm run build -> OK

## Notas

Este cambio prepara la base de navegacion para continuar el desarrollo de funcionalidades
en Perfil y Nueva transaccion sin perder coherencia visual ni estructura de rutas.