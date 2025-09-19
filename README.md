# Sistema de Donaciones

Sistema web para gestión de campañas de donaciones, usuarios y control de donaciones con roles  **donante** y  **administrador** .

---

## Estructura del proyecto

<pre class="overflow-visible!" data-start="390" data-end="1497"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-text"><span><span>sistema-donaciones/
│
├─ backend/
│   ├─ config/                # Configuración de la base de datos (MongoDB)
│   ├─ controllers/           # Lógica de negocio (usuarios, campañas, donaciones)
│   ├─ middlewares/           # Autenticación, roles y permisos
│   ├─ models/                # Esquemas de Mongoose (User, Campaign, Donation)
│   ├─ routes/                # Definición de endpoints
│   ├─ uploads/               # Archivos subidos (imágenes de campañas, avatars)
│   └─ node_modules/          # Dependencias instaladas con npm
    └─ uploads/               # Archivos subidos por el usuario
│
└─ public/
    ├─ registro.html          # Registro de usuarios
    ├─ login.html             # Login de usuarios
    ├─ dashboard.html         # Panel principal de gestión
    ├─ campaigns.html         # Gestion de campañas y sus donaciones
    ├─ donations.html         # Mostrar las donaciones realizadas por el usuario
    ├─ 404.html               # Pagina por ruta errónea (Error 404)
    ├─ js/
      ├─ api.js             # Función genérica fetch al backend
      ├─ auth.js            # Registro, login y logout
      ├─ donations.js       # Carga y gestión de donaciones
      ├─ campaigns.js       # Carga y gestión de campañas
      └─ init.js            # Protege páginas y verifica sesión
      └─ profile.js         # Carga los datos del usuario
      └─ ui.js              # Funcionamiento de los modals
</span></span></code></div></div></pre>

---

## Requisitos

* Node.js >= 18
* MongoDB en ejecución (local o Atlas)
* npm

---

## Instalación y configuración

1. Clonar el repositorio:

<pre class="overflow-visible!" data-start="1658" data-end="1718"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>git </span><span>clone</span><span> <tu-repositorio>
</span><span>cd</span><span> sistema-donaciones
</span></span></code></div></div></pre>

2. Instalar dependencias en el backend:

<pre class="overflow-visible!" data-start="1762" data-end="1796"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>cd</span><span> backend
npm install
</span></span></code></div></div></pre>

3. Crear archivo `.env` en `backend/` con las variables de entorno:

<pre class="overflow-visible!" data-start="1868" data-end="1959"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>MONGO_URI</span><span>=mongodb+srv://xiaomendez:Xiao2008@sistemadonaciones.bfjx8wd.mongodb.net/SistemaDonaciones?retryWrites=true&w=majority:</span><span>27017</span><span>/donationsDB
</span><span>JWT_SECRET</span><span>=supersecreto123
</span><span>PORT</span><span>=</span><span>3001</span><span>
</span><span>ADMIN_ACCESS_CODE</span><span>=</span><span>codigoadmin</span><span>
</span></span></code></div></div></pre>

4. Crear carpeta `uploads/` dentro de `backend/` si no existe:

<pre class="overflow-visible!" data-start="2026" data-end="2059"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>mkdir</span><span> backend/uploads
</span></span></code></div></div></pre>

---

## Levantar la aplicación

1. **Backend**

<pre class="overflow-visible!" data-start="2113" data-end="2150"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>cd</span><span> backend
npm run dev o node server.js
</span></span></code></div></div></pre>

* Esto levantará el backend en `http://localhost:3001` y servirá los endpoints API bajo `/api`.

2. **Frontend**

* Abrir `public/dashboard.html` en un navegador, o servir con un servidor estático (ej. VSCode Live Server).

---

## 🔑 Archivos importantes

### Backend

| Archivo / Carpeta                     | Función                                                   |
| ------------------------------------- | ----------------------------------------------------------|
| `config/`                           | Conexión a MongoDB (`db.js`)                                |
| `controllers/authController.js`     | Registro, login, gestión de JWT                             |
| `controllers/userController.js`     | CRUD de usuarios, obtener info del usuario                  |
| `controllers/campaignController.js` | CRUD de campañas y progreso de donaciones                   |
| `controllers/donationController.js` | Crear donaciones, listar mis donaciones, actualizar estado  |
| `middlewares/auth.js`               | Verificación de JWT y protección de rutas                   |
| `middlewares/roles.js`              | Control de acceso por roles (admin, donante)                |
| `models/`                           | Esquemas de MongoDB:`User`,`Campaign`,`Donation`            |
| `routes/`                           | Definición de rutas y endpoints                             |
| `uploads/`                          | Carpeta para almacenar imágenes de campañas                 |

### Frontend

| Archivo                    | Función                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `public/js/api.js`       | Función genérica `apiFetch`para llamadas al backend con JWT       |
| `public/js/auth.js`      | Registro, login, logout y control de sesión                       |
| `public/js/donations.js` | Mostrar y gestionar las donaciones del usuario                    |
| `public/js/campaigns.js` | Mostrar y gestionar las campañas                                  |
| `public/js/init.js`      | Protección de páginas sensibles y expiración de sesión            |
| `public/js/profile.js`   | Carga los datos del usuario                                       |
| `public/js/ui.js`        | Funcionamiento de los modals                                      |
| `public/register.html`   | Pagina de registro de usuario                                     |
| `public/login.html`      | Página de inicio de sesión                                        |
| `public/dashboard.html`  | Panel para administrar campañas y donaciones                      |
| `public/404.html`        | Pagina a la que se accede en caso de ruta errónea                 |
| `public/campaigns.html`  | Gestionar las campañas (crear, actualizar, donar)                 |
| `public/donations.html`  | Mostrar las donaciones realizadas por el usuario                  |

---

## 💻 Flujo de uso

1. **Registro / Login**
   * Los usuarios se registran como donante o administrador (administrador requiere autorización).
   * El login devuelve un token JWT y almacena información del usuario en `localStorage`.
2. **Dashboard**
   * Listar campañas, ver donaciones, crear/editar campañas (solo administrador).
   * Ver y actualizar el estado de las donaciones (pendiente/aceptada/rechazada).
3. **Donaciones**
   * Los donantes pueden donar a campañas.
   * Cada donación tiene un estado (`pendiente`, `aceptada`, `rechazada`) que puede gestionar un administrador.
4. **Seguridad**
   * Las páginas sensibles requieren token válido.
   * Los roles controlan qué acciones puede realizar cada usuario.

---

## Notas adicionales

* Todas las imágenes se sirven desde `/uploads/`.
* Todas las llamadas al backend usan `/api` como prefijo de ruta.
* SweetAlert2 se utiliza para notificaciones y confirmaciones visuales.





---