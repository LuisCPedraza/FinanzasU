# Historias de Usuario — FinanzasU

---

## HU-01 — Disponibilidad y coherencia de mi información

> Como usuario autenticado, quiero ver mis datos consistentes en todos los módulos para confiar en que no se pierden ni se duplican.

### Alcance técnico
- AuthContext + hooks de carga inicial
- Services de categorías, transacciones y presupuestos
- Manejo de estado de carga/error global

### Criterios de aceptación
- [x] Dado un usuario autenticado, cuando abre la aplicación, entonces solo se cargan sus datos.
- [x] Dado que existe una transacción nueva, cuando regresa al dashboard, entonces los totales reflejan ese cambio.
- [x] Dado un fallo de red, cuando una consulta falla, entonces la UI muestra error y no corrompe el estado existente.

### Criterios técnicos obligatorios
- Todas las consultas usan filtro por usuario autenticado.
- No se permiten consultas directas desde pages; solo hooks/services.

---

## HU-02 — Sesión estable y control de acceso

> Como usuario, quiero que mi sesión sea estable y segura para no perder acceso ni exponer pantallas privadas.

### Alcance técnico
- AuthContext
- ProtectedRoute
- Servicios de autenticación

### Criterios de aceptación
- [x] Dado token válido, cuando recargo la app, entonces permanezco autenticado.
- [x] Dado token inválido o expirado, cuando intento entrar a ruta privada, entonces soy redirigido a login.
- [x] Dado cierre de sesión, cuando confirma logout, entonces no puedo volver con botón atrás a vistas protegidas.

### Criterios técnicos obligatorios
- Limpieza de estado sensible al cerrar sesión.
- Verificación de sesión en rutas privadas.

---

## HU-03 — Registro e inicio de sesión seguros

> Como usuario, quiero registrarme e iniciar sesión de forma confiable para usar la plataforma con seguridad.

### Alcance técnico
- Pantallas Login y Register
- authService
- Validaciones de formulario

### Criterios de aceptación
- [x] Dado datos válidos, cuando envío registro, entonces se crea cuenta y se informa el resultado.
- [x] Dado credenciales incorrectas, cuando intento login, entonces recibo mensaje de error claro.
- [x] Dado login exitoso, cuando finaliza la autenticación, entonces redirige al dashboard.

### Criterios técnicos obligatorios
- Validación de formato de correo.
- Política mínima de contraseña definida y aplicada en frontend.

---

## HU-04 — Actualizar mi perfil y contraseña

> Como usuario, quiero actualizar perfil y contraseña para mantener mi cuenta vigente y segura.

### Alcance técnico
- Pantalla Perfil
- authService
- Formularios de actualización

### Criterios de aceptación
- [x] Dado datos válidos, cuando guardo perfil, entonces se persisten y se reflejan en UI.
- [x] Dado contraseña inválida, cuando intento cambiarla, entonces se bloquea la operación y se informa el motivo.
- [x] Dado cambio exitoso, cuando termina la operación, entonces se muestra confirmación.

### Criterios técnicos obligatorios
- Campos obligatorios con validación.
- Manejo de loading y error por acción.

---

## HU-05 — Páginas de acceso claras y accesibles

> Como usuario, quiero pantallas de acceso claras para completar registro/login sin confusión.

### Alcance técnico
- UI Login/Register
- Componentes Input, Button y mensajes

### Criterios de aceptación
- [x] Dado campo inválido, cuando pierdo foco o envío, entonces se muestra error junto al campo.
- [x] Dado envío de formulario, cuando está en progreso, entonces el botón queda bloqueado con estado de carga.
- [x] Dado dispositivo móvil, cuando visualizo la pantalla, entonces no hay desbordes ni solapamientos.

### Criterios técnicos obligatorios
- Accesibilidad básica en etiquetas y foco.
- Mensajes de error consistentes.

---

## HU-06 — Navegación y perfil fáciles de usar

> Como usuario, quiero navegar fácil entre módulos y acceder al perfil rápidamente para operar sin fricción.

### Alcance técnico
- Layout, Navbar y MobileNav
- Router principal

### Criterios de aceptación
- [x] Dado usuario autenticado, cuando abre el menú, entonces ve accesos a módulos permitidos.
- [x] Dada una ruta activa, cuando navego, entonces el ítem actual se resalta.
- [x] Dado móvil, cuando abro/cierro menú, entonces la interacción es estable y no bloquea la navegación.

### Criterios técnicos obligatorios
- Rutas centralizadas y protegidas.
- Comportamiento responsive verificado.

---

## HU-07 — Validaciones inmediatas en formularios

> Como usuario, quiero validaciones en tiempo de captura para corregir errores antes de guardar.

### Alcance técnico
- Formularios de transacciones, categorías, presupuestos y perfil
- Componentes Input/Select

### Criterios de aceptación
- [x] Dado campo obligatorio vacío, cuando intento guardar, entonces no permite envío y muestra error.
- [x] Dado monto no válido, cuando escribo valor no numérico o ≤ 0, entonces muestra validación.
- [x] Dada fecha inválida, cuando envío formulario, entonces se rechaza con mensaje claro.

### Criterios técnicos obligatorios
- Validaciones compartidas para evitar duplicidad.
- Botón guardar deshabilitado si hay errores.

---

## HU-08 — Menú responsive y edición sin recargar

> Como usuario, quiero que la app actualice vistas sin recargar el navegador para tener una experiencia fluida.

### Alcance técnico
- Hooks CRUD
- Estado local y refresco de datos
- Layout responsive

### Criterios de aceptación
- [x] Dada creación/edición/eliminación exitosa, cuando finaliza la petición, entonces la lista se actualiza automáticamente.
- [x] Dado fallo en operación, cuando ocurre error, entonces se notifica y no se rompe la pantalla.
- [x] Dado uso en móvil, cuando navego entre páginas, entonces mantiene legibilidad y accionabilidad.

### Criterios técnicos obligatorios
- Sin recarga completa de página para CRUD.
- Manejo uniforme de loading/success/error.

---

## HU-09 — Crear sistema completo de logros

> Como estudiante, quiero que exista un sistema completo de logros que evalúe mis acciones financieras y guarde mi progreso, para motivarme y medir mi avance en educación financiera.

### Criterios de aceptación
- [x] Se crea un catálogo de logros configurable (nombre, descripción, ícono, tipo, objetivo, condición, estado activo).
- [x] Se crea la persistencia de progreso por usuario autenticado (avance actual, porcentaje, desbloqueado/no desbloqueado, fecha de desbloqueo).
- [x] El sistema evalúa logros automáticamente al registrar o actualizar eventos clave (transacciones y presupuestos), sin duplicar desbloqueos.
- [x] Se exponen funciones/servicios para consultar todos los logros de un usuario y su estado consolidado.
- [x] El sistema garantiza aislamiento por usuario con políticas RLS activas en las tablas nuevas de logros.
- [x] Se documentan las reglas de negocio de los logros iniciales (mínimo 4) y su comportamiento esperado.

### Definition of Ready
- Tablas de transacciones y presupuestos operativas y con RLS activas.
- Reglas iniciales de logros definidas y aprobadas por negocio/producto.
- Convención de estados de logro definida (bloqueado, en progreso, desbloqueado).
- Estrategia de recálculo/actualización de logros acordada (evento inmediato o recálculo controlado).

---

## HU-10 — Adaptar el sistema de logros al perfil del usuario

> Como estudiante, quiero ver mis logros reales en el perfil con su progreso y estado, para entender mis avances y saber qué me falta para desbloquear nuevos logros.

### Criterios de aceptación
- [x] La sección de insignias en perfil consume el sistema de logros real (no datos estáticos).
- [x] Cada insignia muestra estado correcto para el usuario autenticado (desbloqueada, en progreso o bloqueada).
- [x] Se muestra progreso visible para logros no completados (porcentaje o contador actual vs objetivo).
- [x] Al cumplir un logro, la vista de perfil se actualiza sin recargar la aplicación y se muestra confirmación de logro desbloqueado.
- [x] El botón "Ver todos los logros" muestra el listado completo con detalle de cada regla y estado.
- [x] Se contemplan estados de carga, vacío y error con copys en español.

### Definition of Ready
- HU-09 completada, probada y disponible para consumo en frontend.
- Hook/servicio de logros disponible para la página de perfil.
- Ruta protegida de perfil activa en el router.
- Diseño final de estados visuales de insignias validado (desbloqueada, en progreso, bloqueada).

---

## HU-11 — Filtrar y paginar historial de transacciones

> Como estudiante, quiero filtrar y paginar mi historial para encontrar rápido movimientos específicos.

### Criterios de aceptación
- [x] El historial permite filtrar por mes/año, texto, tipo y categoría de forma combinada.
- [x] Hay paginación con tamaños 10, 25 y 50 registros por página.
- [x] El orden por defecto es fecha descendente.
- [x] Existe estado vacío claro y acción para limpiar filtros.

### Definition of Ready
- Reglas de combinación de filtros documentadas.
- Estrategia de paginación (cliente/servidor) seleccionada.
- Índices SQL revisados para consultas por user_id y fecha.
- Diseño de tabla responsive aprobado.

---

## HU-12 — Exportar CSV de mis transacciones

> Como estudiante, quiero exportar mis transacciones filtradas para analizarlas fuera de la plataforma.

### Criterios de aceptación
- [x] Botón "Exportar CSV" descarga archivo con encabezados: Fecha, Descripción, Categoría, Tipo, Monto.
- [x] El CSV respeta los filtros activos en pantalla.
- [x] El nombre del archivo incluye mes y año (ej: `transacciones-2026-04.csv`).
- [x] La exportación finaliza en menos de 2 segundos con hasta 1.000 registros.

### Definition of Ready
- Formato final de columnas y orden validado por negocio.
- Estrategia de serialización (cliente) definida.
- Reglas de formato numérico/moneda acordadas.
- Casos con caracteres especiales (comas, saltos de línea) contemplados.

---

## HU-13 — Sistema de notificaciones integrado en el header

> Como estudiante, quiero recibir notificaciones relevantes dentro de la aplicación y consultarlas desde el header de cada módulo, para enterarme de eventos importantes de mis finanzas sin perder contexto.

### Criterios de aceptación
- [x] Se implementa el modelo completo de notificaciones con persistencia por usuario autenticado (tipo, título, mensaje, módulo origen, estado leída/no leída, fecha de creación y referencia opcional al recurso relacionado).
- [x] Se crean políticas RLS para que cada usuario solo pueda consultar y actualizar sus propias notificaciones.
- [x] Se implementa un servicio de notificaciones con operaciones para: listar, contar no leídas, marcar una como leída y marcar todas como leídas.
- [x] El ícono de notificaciones se integra en el header compartido y queda visible en todos los módulos protegidos.
- [x] El header muestra indicador visual de no leídas con contador y estado actualizado sin recargar la aplicación.
- [x] Al abrir notificaciones desde el header, se muestra un panel o listado con estados de carga, vacío y error, con copys en español.
- [x] Al hacer clic en una notificación, se marca como leída y redirige al módulo o sección relacionada cuando aplique.
- [x] El sistema contempla reglas iniciales de generación de notificaciones para eventos clave (transacción registrada, presupuesto excedido, meta o logro alcanzado).
- [x] Se evita la duplicación de notificaciones del mismo evento en una misma ventana de tiempo definida.

### Definition of Ready
- Header compartido y rutas protegidas operativas en todos los módulos.
- Lineamientos UX del panel de notificaciones validados (lectura, navegación y feedback visual).

---

## HU-14 — Reglas de notificación en Perfil

> Como estudiante, quiero activar o desactivar mis reglas de notificación desde mi perfil, para decidir qué avisos recibo y con qué frecuencia.

### Criterios de aceptación
- [x] Al ingresar a Perfil, el sistema carga las preferencias actuales del usuario autenticado y refleja su estado en los switches.
- [x] Al cambiar cualquier switch (Alertas diarias de presupuesto, Resumen semanal, Novedades del sistema), la preferencia se guarda en base de datos para ese usuario.
- [x] Si el guardado es exitoso, se muestra confirmación visual; si falla, se informa el error y el switch vuelve al estado anterior.
- [x] Las preferencias quedan persistidas entre sesiones y dispositivos.
- [x] El motor de notificaciones respeta estas reglas al generar y mostrar notificaciones.
- [x] La consulta y actualización de preferencias se protege con RLS para evitar acceso entre usuarios.
- [x] Se contemplan estados de carga inicial y error de lectura en la sección de reglas.

### Definition of Ready
- Sección visual de "Reglas de notificación" disponible en Perfil.
- Usuario autenticado y contexto de sesión accesible en frontend.
- Catálogo de reglas definido y estable.
- Estructura de persistencia acordada para preferencias de notificación.
- Copys de feedback y error definidos en español.

---

## HU-15 — Contexto académico en Perfil

> Como estudiante, quiero que mi contexto académico en el perfil sea funcional y persistente, para mantener actualizada mi información universitaria y usarla en personalizaciones del sistema.

### Criterios de aceptación
- [x] Al ingresar a Perfil, el bloque "Contexto académico" carga datos reales del usuario autenticado (semestre actual, meta de grado y estado académico).
- [x] El usuario puede actualizar esos 3 campos y guardar cambios desde la interfaz.
- [x] El sistema valida los datos antes de guardar: semestre actual obligatorio dentro de catálogo permitido; meta de grado obligatoria con formato de año válido; estado académico obligatorio dentro de valores permitidos (Activo, Pausado, Egresado).
- [x] Si el guardado es exitoso, se muestra confirmación visual y el bloque se actualiza sin recargar la aplicación.
- [x] Si ocurre error de lectura o guardado, se muestra mensaje claro en español y no se pierden los valores previos válidos.
- [x] La información queda persistida entre sesiones y dispositivos para el mismo usuario.
- [x] El acceso a consulta y actualización se protege con RLS para que cada usuario solo gestione su propio contexto académico.

### Definition of Ready
- Bloque visual de "Contexto académico" disponible en la vista de Perfil.
- Estructura de persistencia definida para los campos académicos (tabla o columnas en perfil).
- Usuario autenticado disponible en frontend para asociar datos por user_id.
- Catálogo de valores válidos para semestre y estado académico definido por producto.
- Copys de validación, éxito y error definidos en español.

---

## HU-16 — Recuperar contraseña y funcionalidad "Recordarme en este dispositivo"

> Como estudiante, quiero recuperar mi contraseña cuando la olvido y elegir si deseo que mi sesión se recuerde en este dispositivo, para acceder de forma segura y cómoda.

### Criterios de aceptación
- [x] En la pantalla de login existe la opción "¿Olvidaste tu contraseña?" y abre el flujo de recuperación por correo.
- [x] Al enviar el correo, el sistema muestra confirmación neutral en español, sin revelar si el email está registrado o no.
- [x] El sistema envía un enlace seguro de recuperación con expiración y uso único.
- [x] El enlace redirige a una pantalla para establecer nueva contraseña y confirmarla.
- [x] La nueva contraseña valida reglas mínimas definidas por el sistema y coincidencia entre ambos campos.
- [x] Si el enlace está vencido o es inválido, se informa al usuario y se ofrece solicitar uno nuevo.
- [x] Al cambiar la contraseña correctamente, se muestra confirmación y se redirige al login.
- [x] En login existe el checkbox "Recordarme en este dispositivo".
- [x] Si el checkbox está activo, la sesión persiste en el mismo dispositivo después de cerrar y abrir el navegador, hasta logout o expiración.
- [x] Si el checkbox está inactivo, la sesión es temporal y no persiste al cerrar el navegador.
- [x] Al cerrar sesión manualmente, se eliminan tokens locales y se requiere autenticación nuevamente.
- [x] Todo el flujo contempla estados de carga y mensajes de error en español.

### Definition of Ready
- Servicio de autenticación y envío de correos de recuperación configurado.
- Rutas de frontend definidas para solicitar recuperación y actualizar contraseña.
- Política de seguridad acordada para expiración y uso único del enlace de recuperación.
- Estrategia técnica definida para persistencia de sesión según estado de "Recordarme".
- Copys de validación, éxito y error aprobados en español.
- Casos de prueba definidos para escenarios exitosos, error, enlace vencido y logout.

---

## HU-17 — Templates de correo para verificación y recuperación de contraseña

> Como estudiante, quiero recibir correos claros y confiables para verificar mi cuenta y recuperar mi contraseña, para completar mi acceso de forma segura y sin confusiones.

### Criterios de aceptación
- [ ] Se configura un template de correo para verificación de cuenta con identidad visual de la aplicación (logo, nombre y estilo).
- [ ] Se configura un template de correo para recuperación de contraseña con identidad visual consistente.
- [ ] Ambos correos incluyen asunto, preencabezado y contenido en español con instrucciones claras.
- [ ] Los templates usan variables dinámicas del sistema (nombre de usuario si existe, enlace seguro y tiempo de expiración).
- [ ] Cada correo incluye un botón principal de acción y un enlace alternativo en texto plano.
- [ ] El enlace de verificación redirige correctamente al flujo de confirmación de cuenta y el de recuperación al flujo de cambio de contraseña.
- [ ] Se valida visualización responsive en móvil y escritorio, y compatibilidad básica con clientes de correo comunes.
- [ ] Se prueban ambos flujos de extremo a extremo y se confirma que los correos llegan correctamente.
- [ ] Los templates incluyen advertencias de seguridad y canal de soporte para reportar actividad no reconocida.
- [ ] Se contemplan mensajes de error en caso de fallo de envío y reintento desde la interfaz.

### Definition of Ready
- Proveedor de correo transaccional configurado y operativo.
- URLs oficiales de redirección para verificación y recuperación definidas por ambiente.
- Copys aprobados en español para asunto, cuerpo, errores y advertencias de seguridad.
- Criterios de prueba definidos para validar entrega, renderizado y redirecciones.

---

## HU-18 — Crear el dashboard

> Como usuario, quiero un dashboard central que muestre mi estado financiero actual, para ver ingresos, gastos y saldo de forma rápida y tomar mejores decisiones.

### Criterios de aceptación
- [x] El dashboard incluye tarjetas con saldo total, ingresos recientes, gastos recientes y ahorro mensual.
- [x] Se muestran gráficos de tendencia de gastos e ingresos.
- [x] Incluye accesos directos a transacciones, presupuestos y reportes.
- [x] Los datos se actualizan con la información actual del usuario.
- [x] El diseño es responsivo para escritorio y móvil.
- [x] El dashboard carga sin errores y muestra un indicador de carga mientras trae datos.

### Definition of Ready
- Diseño visual aprobado o referencia de UI disponible.
- Datos de ejemplo definidos para saldo, ingresos, gastos y ahorro.
- Endpoints disponibles para obtener resumen financiero.
- Requisitos funcionales claros para cada tarjeta y gráfico.
- Criterios de prueba definidos para renderizado, actualización y responsividad.

---

## HU-19 — Funcionalidad para depositar desde el dashboard

> Como usuario, quiero poder realizar depósitos desde el dashboard, para aumentar mi saldo y registrar ingresos sin cambiar de pantalla.

### Criterios de aceptación
- [x] El dashboard tiene un botón o acción clara para iniciar un depósito.
- [x] Al hacer clic se abre un formulario con campos: monto, categoría/propósito, fecha y descripción opcional.
- [x] El depósito se registra correctamente y actualiza el saldo en el dashboard.
- [x] Se valida que el monto sea numérico y mayor a cero.
- [x] Muestra mensaje de éxito o error según el resultado.
- [x] El flujo es usable en escritorio y móvil.

### Definition of Ready
- Requisitos de campos y validaciones acordados.
- Endpoint de registro de transacciones disponible.
- Estado esperado tras el depósito definido (saldo actualizado / lista de transacciones).

---

## HU-20 — Generar reportes de gastos por categoría

> Como usuario, quiero generar reportes de gastos por categoría, para entender en qué áreas gasto más y gestionar mejor mi dinero.

### Criterios de aceptación
- [x] Se puede seleccionar un rango de fechas para el reporte.
- [x] El reporte agrupa los gastos por categoría y muestra totales.
- [x] Incluye visualización tipo gráfica o tabla con categorías y montos.
- [x] Permite exportar el reporte a CSV o visualizar en pantalla.
- [x] Muestra mensajes claros si no hay datos en el periodo seleccionado.
- [x] Es responsivo y compatible con clientes comunes.

### Definition of Ready
- Lista de categorías y datos de gastos disponibles.
- Endpoint o lógica para agrupar gastos por categoría definido.
- Diseño de la vista de reportes aprobado.
- Criterios de prueba para rango de fechas, agrupación, exportación y casos sin datos establecidos.

---

## HU-21 — Configurar alertas del módulo de presupuestos

> Como usuario, quiero recibir alertas del módulo de presupuestos, para saber cuándo me acerco o supero mis límites de gasto.

### Criterios de aceptación
- [x] El módulo presupuestos muestra alertas cuando el gasto alcanza cierto porcentaje del presupuesto.
- [x] Existen al menos dos niveles de alerta: advertencia y exceso.
- [x] Las alertas se muestran en el dashboard y en la vista de presupuestos.
- [x] Incluyen mensajes claros con categoría y estado del presupuesto.
- [x] Se puede configurar el umbral de advertencia si está en alcance del MVP.
- [x] Se valida el comportamiento con presupuesto activo y sin presupuesto.

### Definition of Ready
- Reglas de alerta definidas (porcentaje de advertencia, límite, condiciones).
- Datos de presupuestos disponibles en backend o mock.
- Diseño de presentación de alertas disponible.
- Criterios de prueba para disparar alerta de advertencia, alerta de exceso y ausencia de alertas.
- Flujo claro de actualización de estado presupuestal tras nuevas transacciones.

### Revisión de implementación (HU-21)

- **Estado:** Implementado en frontend y backend parcial.
- **Qué está presente:**
	- Detección y notificación cuando un gasto excede el `monto_limite` del presupuesto (notificación tipo `presupuesto`).
	- Visualización de porcentaje de uso y barras codificadas por color en el `Dashboard` y en la vista de `Presupuestos`/categorías, mostrando estados de advertencia/exceso visuales.
	- Mensajes de notificación incluyen la categoría y el periodo afectados y enlazan a `/presupuestos`.
	- Preferencia `alertas_diarias` respeta si el usuario desea recibir notificaciones.
- **Qué falta / mejora recomendada:**
	- No existe actualmente un umbral configurable por presupuesto para la alerta de advertencia (p.ej. notificar al alcanzar 80%). Recomendado: añadir campo `umbral_alerta_pct` en la tabla de presupuestos y lógica para generar notificaciones cuando el porcentaje alcance el umbral antes de exceder el límite.

Esta nota se añade como registro de revisión para HU-21; el cumplimiento parcial/total se refleja también en `docs/HU_FinanzasU.md` donde aparecen los criterios marcados.

---

## HU-22 — Configurar meta de ahorro mensual en el dashboard y presupuestos

> Como usuario, quiero establecer una meta de ahorro mensual desde el dashboard y el módulo de presupuestos, para monitorear mi progreso y ahorrar de forma constante.

### Criterios de aceptación
- [ ] El usuario puede definir o editar la meta de ahorro mensual desde el dashboard.
- [ ] La meta también se puede ver y ajustar desde la vista de presupuestos.
- [ ] El dashboard muestra el avance actual en porcentaje y monto ahorrado.
- [ ] El sistema compara el ahorro real con la meta y muestra estado (cumplido, en progreso, riesgo).
- [ ] Se valida que el monto de la meta sea positivo y razonable.
- [ ] El dato persiste y se refleja en ambas vistas sin inconsistencias.

### Definition of Ready
- Requisitos de campos y validaciones de la meta definidos.
- Endpoint o almacenamiento para guardar la meta disponible.
- Diseño de UI para definir y mostrar la meta aprobado.
- Criterios de prueba para guardar meta, mostrar avance y sincronización dashboard-presupuestos.
- Condiciones de error y mensajes del usuario documentados.
