# HU - Filtros y Paginación de Transacciones

## Resumen

Como estudiante, quiero filtrar y paginar mi historial para encontrar rápido movimientos específicos.

---

## Archivos involucrados

| Archivo | Rol |
|---|---|
| `src/hooks/useTransaccionesFiltros.js` | Estado de filtros, cálculo de meses/años disponibles, filtrado combinado, paginación |
| `src/components/ui/FiltrosTransacciones.jsx` | Panel colapsable con controles de filtro y multi-selección |
| `src/components/ui/Paginacion.jsx` | Controles de navegación de páginas con selector de tamaño |
| `src/pages/Transacciones.jsx` | Integración de filtros + paginación + estados vacíos |
| `scripts/seed-transacciones.js` | Seeder/destructor de datos de prueba |

---

## Reglas de combinación de filtros

Todos los filtros se aplican de forma **aditiva (AND)**: cada filtro activo reduce el conjunto de resultados. El orden de aplicación es:

```
transacciones (todas)
  → filtro de meses     (si hay meses seleccionados)
  → filtro de años      (si hay años seleccionados)
  → filtro de tipo      (si se eligió ingreso o gasto)
  → filtro de categorías (si hay categorías seleccionadas)
  → filtro de texto      (si hay texto en el buscador)
  → paginación           (slice del resultado final)
```

### Detalle por filtro

#### Meses (multi-selección)
- Permite seleccionar **uno o varios** meses simultáneamente.
- Solo muestra los meses que tienen al menos una transacción (derivados dinámicamente con `useMemo`).
- Si no hay ningún mes seleccionado, no aplica ningún filtro de mes.
- Lógica: `transaccion.mes ∈ mesesSeleccionados`

#### Años (multi-selección)
- Permite seleccionar **uno o varios** años.
- Solo muestra años con transacciones reales.
- Si no hay ningún año seleccionado, no aplica filtro de año.
- Lógica: `transaccion.año ∈ añosSeleccionados`

#### Tipo (selección única)
- Opciones: **Todos** / **Ingresos** / **Gastos**.
- Cuando se elige "Todos" (valor vacío), no aplica filtro de tipo.
- Lógica: `transaccion.tipo === tipoSeleccionado`

#### Categorías (multi-selección)
- Permite seleccionar **una o varias** categorías.
- Si no hay ninguna seleccionada, no aplica filtro de categoría.
- Lógica: `transaccion.categoria_id ∈ categoríasSeleccionadas`

#### Texto (búsqueda libre)
- Busca en el campo `descripcion` de forma **case-insensitive**.
- Si el campo está vacío o solo contiene espacios, no aplica filtro.
- Lógica: `transaccion.descripcion.toLowerCase().includes(texto.trim().toLowerCase())`

### Ejemplos de combinaciones

| Configuración | Resultado |
|---|---|
| Mes: Marzo · Tipo: Gasto | Solo gastos del mes de marzo |
| Años: 2025, 2026 · Categoría: Alimentación | Transacciones de Alimentación en cualquier mes de 2025 o 2026 |
| Meses: Feb, Mar · Tipo: Ingreso · Texto: "beca" | Ingresos de febrero o marzo cuya descripción contenga "beca" |
| Sin filtros activos | Todas las transacciones ordenadas por fecha descendente |

### Orden por defecto
El listado siempre se muestra ordenado por **fecha descendente** (más reciente primero), luego por `id` descendente como criterio de desempate. Este orden proviene directamente del servicio `listarTransacciones` y no se altera por los filtros.

---

## Paginación

**Estrategia elegida: cliente (in-memory)**

Todos los datos se cargan una sola vez en `AppDataContext`. El slice de paginación se calcula con `useMemo` sobre el array ya filtrado.

| Parámetro | Valor |
|---|---|
| Tamaños disponibles | 10 / 25 / 50 registros por página |
| Tamaño por defecto | 10 |
| Orden | Fecha descendente (heredado del fetch) |
| Reset de página | Se reinicia a 1 al cambiar cualquier filtro o el tamaño de página |

Cuando el filtro reduce el total de páginas por debajo de la página actual, se ajusta automáticamente a la última página válida (`paginaValida = Math.min(pagina, totalPaginas)`).

---

## Estados vacíos

| Situación | Mensaje | Acción disponible |
|---|---|---|
| El usuario no tiene ninguna transacción | "No hay transacciones aun" | Botón "Agregar transaccion" |
| Los filtros activos no arrojan resultados | "Sin resultados · No hay transacciones que coincidan con los filtros aplicados" | Botón "Limpiar filtros" |

---

## Limpiar filtros

El botón **"Limpiar todos los filtros"** aparece en el panel de filtros solo cuando hay al menos un filtro activo. Al pulsarlo:
- Todos los arrays de multi-selección se vacían.
- Tipo vuelve a "Todos".
- El campo de texto se vacía.
- La paginación vuelve a la página 1.

El conteo de filtros activos (badge numérico en el botón "Filtros") suma:
`meses.length + años.length + categorías.length + (tipo !== '' ? 1 : 0)`

---

## Scripts de datos de prueba (Seeder)

El archivo `scripts/seed-transacciones.js` permite poblar y limpiar transacciones de prueba para verificar el comportamiento de filtros y paginación.

### Requisitos
- Node.js 18+
- Archivo `.env.local` en la raíz del proyecto con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

### Insertar datos de prueba

```bash
node scripts/seed-transacciones.js <email> <password>
```

Genera **75 transacciones** distribuidas en 3 meses (Febrero, Marzo y Abril 2026):
- 25 registros por mes
- ~20% ingresos, ~80% gastos
- Categorías aleatorias tomadas de las categorías reales del usuario
- Montos realistas: ingresos entre $50.000–$800.000, gastos entre $1.000–$120.000
- Todas las descripciones llevan el prefijo `[SEED]` como marcador

El script inserta en lotes de 25 y muestra el progreso en consola. Si ya existen registros `[SEED]` previos, lo informa pero no bloquea la operación.

### Eliminar datos de prueba

```bash
node scripts/seed-transacciones.js <email> <password> --clean
```

Elimina **únicamente** las transacciones cuya descripción empiece con `[SEED]` y que pertenezcan al `user_id` autenticado. No toca ningún otro dato.

### Scripts npm (atajos)

```bash
npm run seed -- <email> <password>          # insertar
npm run seed:clean -- <email> <password>    # limpiar
```

### Comportamiento del seeder por pasos

```
1. Lee .env.local desde la raíz del proyecto
2. Autentica con email + password usando supabase.auth.signInWithPassword
3. Obtiene categorías disponibles del usuario (predeterminadas + propias)
4. [seed]  Genera los registros y los inserta en lotes de 25
   [clean] Hace DELETE WHERE descripcion LIKE '[SEED]%' AND user_id = <id>
5. Imprime resumen y código de salida
```

### Seguridad
- Las credenciales se pasan como argumentos de terminal y **nunca se escriben en ningún archivo**.
- El script usa el `anon key` de Supabase con las RLS activas; solo puede operar sobre datos del usuario autenticado.
- No usar en entornos de producción compartidos.
