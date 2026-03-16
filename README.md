# 💰 FinanzasU

> Plataforma web de gestión financiera personal dirigida a estudiantes universitarios.

![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?style=flat-square&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-En%20desarrollo-orange?style=flat-square)
![Universidad](https://img.shields.io/badge/Universidad%20del%20Valle-Sede%20Zarzal-1A5276?style=flat-square)

---

## 📋 Tabla de contenido

- [Descripción](#-descripción)
- [Funcionalidades](#-funcionalidades)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación local](#-instalación-local)
- [Base de datos](#-base-de-datos)
- [API endpoints](#-api-endpoints)
- [Metodología Scrum](#-metodología-scrum)
- [Equipo](#-equipo)

---

## 📖 Descripción

**FinanzasU** es una plataforma web que ayuda a estudiantes universitarios a tomar el control de sus finanzas personales. Permite registrar ingresos y gastos, establecer presupuestos mensuales por categoría, recibir alertas automáticas al acercarse a los límites de gasto y visualizar estadísticas interactivas sobre los hábitos de consumo.

El proyecto surge como respuesta a una necesidad real: la mayoría de estudiantes universitarios asume responsabilidades económicas sin formación financiera previa. Las aplicaciones financieras existentes están orientadas a usuarios con experiencia o requieren vinculación bancaria, lo que limita su utilidad para este público.

Desarrollado como proyecto académico en la **Universidad del Valle sede Zarzal**, bajo la asignatura *Introducción a la Gestión de Proyectos de Software*, aplicando metodología **Scrum** en 5 sprints de 15 días.

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| 🔐 **Autenticación** | Registro, login y logout con sesiones PHP y contraseñas hasheadas con bcrypt |
| 💸 **Transacciones** | Registrar, editar, eliminar, filtrar, paginar y exportar a CSV |
| 🏷️ **Categorías** | Categorías predeterminadas del sistema + personalizadas por usuario |
| 📊 **Presupuesto** | Límites mensuales por categoría con alertas al 80% y 100% del gasto |
| 📈 **Dashboard** | Gráficas interactivas con Chart.js: torta, barras, línea y tarjetas de resumen |
| 👤 **Perfil** | Edición de datos personales y cambio de contraseña |

---

## 🛠️ Stack tecnológico

```
Frontend      →  HTML5 + CSS3 + JavaScript (ES6+)
Backend       →  PHP 8.x + PDO
Base de datos →  MySQL 8.x
Gráficas      →  Chart.js 4.x (CDN)
Seguridad     →  bcrypt + $_SESSION
Versiones     →  Git + GitHub
```

---

## 📁 Estructura del proyecto

```
finanzasU/
│
├── public/                     # Todo lo accesible desde el navegador
│   ├── css/
│   │   ├── main.css            # Variables globales, layout, navbar
│   │   └── auth.css            # Estilos de login y registro
│   ├── js/
│   │   ├── main.js             # Utilidades globales: formatMoneda(), toggle navbar
│   │   ├── auth.js             # Validaciones y fetch() de login/registro
│   │   ├── transacciones.js    # CRUD, filtros, paginación, exportación CSV
│   │   ├── categorias.js       # Gestión de categorías
│   │   ├── presupuestos.js     # Presupuestos y alertas visuales
│   │   ├── dashboard.js        # Inicialización de gráficas Chart.js
│   │   └── perfil.js           # Actualización de perfil y contraseña
│   └── components/
│       ├── navbar.php          # Navegación lateral reutilizable
│       └── layout.php          # Head, navbar y footer base
│
├── app/
│   ├── config/
│   │   ├── config.php          # Constantes globales, session_start()
│   │   └── Database.php        # Conexión PDO centralizada
│   ├── controllers/
│   │   ├── AuthController.php
│   │   ├── TransaccionController.php
│   │   ├── CategoriaController.php
│   │   ├── PresupuestoController.php
│   │   ├── DashboardController.php
│   │   └── PerfilController.php
│   ├── models/
│   │   ├── Usuario.php
│   │   ├── Transaccion.php
│   │   ├── Categoria.php
│   │   ├── Presupuesto.php
│   │   └── Dashboard.php
│   └── helpers/
│       └── Auth.php            # requireLogin() — protección de rutas
│
├── api/                        # Endpoints consumidos por el frontend
│   ├── transacciones.php
│   ├── categorias.php
│   ├── presupuestos.php
│   ├── dashboard.php
│   ├── perfil.php
│   └── exportar.php
│
├── database/
│   ├── schema.sql              # Crea todas las tablas desde cero
│   └── seeds.sql               # Datos de prueba
│
├── docs/
│   ├── diagrama-ER.png         # Diagrama entidad-relación
│   ├── API.md                  # Documentación de endpoints
│   └── postman-collection.json # Colección Postman exportada
│
├── pages/                      # Páginas PHP protegidas
│   ├── dashboard.php
│   ├── transacciones.php
│   ├── categorias.php
│   ├── presupuestos.php
│   └── perfil.php
│
├── login.php
├── register.php
├── logout.php
├── index.php                   # Redirección: sesión activa → dashboard, si no → login
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Instalación local

### Requisitos previos

- PHP 8.0 o superior
- MySQL 8.0 o superior
- Servidor local: [XAMPP](https://www.apachefriends.org/), [Laragon](https://laragon.org/) o similar
- Git

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/finanzasU.git
cd finanzasU
```

### Paso 2 — Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales locales:

```env
DB_HOST=localhost
DB_NAME=finanzas_u
DB_USER=root
DB_PASS=
APP_URL=http://localhost/finanzasU
```

### Paso 3 — Crear la base de datos

Desde phpMyAdmin o la consola MySQL:

```sql
CREATE DATABASE finanzas_u CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Luego ejecuta los scripts en orden:

```bash
mysql -u root -p finanzas_u < database/schema.sql
mysql -u root -p finanzas_u < database/seeds.sql
```

### Paso 4 — Configurar el servidor local

Coloca la carpeta del proyecto dentro de `htdocs` (XAMPP) o `www` (Laragon):

```
C:/xampp/htdocs/finanzasU/
```

### Paso 5 — Abrir en el navegador

```
http://localhost/finanzasU
```

La página de inicio redirige automáticamente al login. Puedes usar el usuario de prueba incluido en `seeds.sql`:

```
Correo:     test@finanzasu.com
Contraseña: Test1234
```

---

## 🗄️ Base de datos

El esquema contiene 4 tablas principales:

```
usuarios          →  id, nombre, correo, contrasena, fecha_registro
categorias        →  id, nombre, tipo, usuario_id, icono, es_predeterminada
transacciones     →  id, usuario_id, categoria_id, monto, tipo, descripcion, fecha
presupuestos      →  id, usuario_id, categoria_id, monto_limite, mes, anio
```

Diagrama ER completo: [`/docs/diagrama-ER.png`](docs/diagrama-ER.png)

> **Importante:** todas las consultas SQL usan **prepared statements PDO**. No existe ninguna concatenación directa de variables en las queries.

---

## 🔌 API Endpoints

Todos los endpoints están en `/api/` y retornan JSON. Requieren sesión activa excepto los de autenticación.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/login.php` | Iniciar sesión |
| `POST` | `/register.php` | Crear cuenta |
| `GET` | `/logout.php` | Cerrar sesión |
| `GET` | `/api/transacciones.php` | Listar transacciones del mes (con filtros y paginación) |
| `POST` | `/api/transacciones.php` | Crear transacción |
| `PUT` | `/api/transacciones.php` | Editar transacción |
| `DELETE` | `/api/transacciones.php` | Eliminar transacción |
| `GET` | `/api/exportar.php` | Descargar historial CSV |
| `GET` | `/api/categorias.php` | Listar categorías del usuario |
| `POST` | `/api/categorias.php` | Crear categoría |
| `PUT` | `/api/categorias.php` | Editar categoría |
| `DELETE` | `/api/categorias.php` | Eliminar categoría |
| `GET` | `/api/presupuestos.php` | Listar presupuestos del mes |
| `POST` | `/api/presupuestos.php` | Crear presupuesto |
| `PUT` | `/api/presupuestos.php` | Editar presupuesto |
| `DELETE` | `/api/presupuestos.php` | Eliminar presupuesto |
| `GET` | `/api/dashboard.php?accion=resumen` | Totales del mes |
| `GET` | `/api/dashboard.php?accion=gastos-categoria` | Datos gráfica de torta |
| `GET` | `/api/dashboard.php?accion=evolucion` | Datos gráfica de barras |
| `GET` | `/api/dashboard.php?accion=top-categorias` | Top 5 categorías |
| `POST` | `/api/perfil.php` | Actualizar nombre y correo |
| `PUT` | `/api/perfil.php` | Cambiar contraseña |

Documentación completa de parámetros y respuestas: [`/docs/API.md`](docs/API.md)

---

## 🔄 Metodología Scrum

El proyecto se desarrolla en **5 sprints de 15 días** con la siguiente distribución:

| Sprint | Período | Módulos |
|---|---|---|
| Sprint 1 | Días 1–15 | Base de datos, autenticación y sesión |
| Sprint 2 | Días 16–30 | Registro y gestión de transacciones |
| Sprint 3 | Días 31–45 | Categorías y presupuesto mensual |
| Sprint 4 | Días 46–60 | Dashboard y visualizaciones Chart.js |
| Sprint 5 | Días 61–75 | Seguridad, pruebas y entrega final |

### Flujo de trabajo Git

```
main          ←  producción (solo merge desde develop)
  └── develop ←  integración del sprint
        └── feature/HU-XX-nombre-de-la-historia
```

**Convención de commits:**

```
feat:     nueva funcionalidad
fix:      corrección de bug
docs:     cambios en documentación
style:    cambios de CSS o formato sin lógica
refactor: refactorización sin cambio de comportamiento
test:     pruebas
```

### Definición de terminado (DoD)

Una historia está terminada cuando:

- ✅ Código en GitHub con commit descriptivo
- ✅ Pull Request aprobado por al menos un compañero
- ✅ Probada en escenario exitoso y de error
- ✅ Endpoints PHP responden con códigos HTTP correctos
- ✅ Interfaz responsive en 375px y 1280px
- ✅ Mensajes al usuario en español sin errores técnicos visibles
- ✅ Todas las queries usan prepared statements PDO
- ✅ No se rompió ninguna funcionalidad anterior

---



**Docente:** Gustavo Adolfo Osorio  
**Asignatura:** Introducción a la Gestión de Proyectos de Software  
**Universidad del Valle — Sede Zarzal · 2026**

---

<div align="center">
  <sub>Desarrollado con ❤️ por el equipo FinanzasU · Universidad del Valle 2026</sub>
</div>
