// Cargamos variables de entorno desde .env
require('dotenv').config();

// Importamos Express para crear la API
const express = require('express');

// Importamos CORS para permitir solicitudes desde otros dominios
const cors = require('cors');

// Importamos path para manejar rutas de archivos
const path = require('path');

// Importamos la función para conectar a la base de datos MongoDB
const conectarDB = require('./config/db');

// Creamos la instancia de la aplicación Express
const app = express();

// Middleware para permitir solicitudes CORS
app.use(cors());

// Middleware para parsear JSON en el body de las solicitudes
app.use(express.json());

// ==========================
// Conexión a la base de datos
// ==========================
conectarDB(); // Ejecuta la función que conecta a MongoDB

// ==========================
// Servir archivos subidos
// ==========================
// La carpeta 'uploads' se hará accesible desde la ruta /uploads
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

// ==========================
// Servir archivos estáticos del frontend
// ==========================
// La carpeta pública (HTML, CSS, JS) se sirve como contenido estático
app.use(express.static(path.join(__dirname,'../public')));

// ==========================
// Rutas de la API
// ==========================
// Ruta de autenticación (registro, login)
app.use('/api/auth', require('./routes/authRoutes'));

// Ruta de gestión de usuarios (listado, actualización, eliminación)
app.use('/api/users', require('./routes/userRoutes'));

// Ruta de campañas (crear, listar, actualizar, eliminar)
app.use('/api/campaigns', require('./routes/campaignRoutes'));

// Ruta de donaciones (crear, listar, actualizar estado)
app.use('/api/donations', require('./routes/donationRoutes'));

// Ruta de dashboard y estadísticas
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// ==========================
// Fallback para rutas no encontradas (404)
// ==========================
app.get('*', (req,res)=> {
  res.status(404); // Código 404 Not Found
  if (req.accepts('html')) 
    // Si el cliente acepta HTML, enviamos el archivo 404.html
    return res.sendFile(path.join(__dirname,'../public/404.html'));
  // Si no, enviamos un JSON con error
  return res.json({ error: 'Not found' });
});

// ==========================
// Inicializar servidor
// ==========================
const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=> console.log(`🚀 API en http://localhost:${PORT}`));