// Importamos JWT para trabajar con tokens de autenticación
const jwt = require('jsonwebtoken');
// Importamos el modelo de usuario
const User = require('../models/User');

// =========================
// Middleware de autenticación
// =========================
async function authMiddleware(req, res, next) {
  // Buscamos el token en diferentes lugares:
  // - Encabezados (Authorization)
  // - Body (token)
  // - Query string (token)
  const auth = req.headers['authorization'] || req.body.token || req.query.token;

  // Si no existe el token, devolvemos error 401 (no autorizado)
  if (!auth) return res.status(401).json({ error: 'Token requerido' });

  // Si el token viene con el prefijo "Bearer ", lo quitamos para quedarnos solo con el valor
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

  try {
    // Verificamos el token con la clave secreta
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Buscamos el usuario en la base de datos con el ID del token
    // Excluimos el campo "clave" (contraseña)
    req.user = await User.findById(payload.id).select('-clave');

    // Si el usuario no existe en la base de datos, rechazamos la petición
    if (!req.user) return res.status(401).json({ error: 'Usuario no existe' });

    // Si todo está bien, pasamos al siguiente middleware o controlador
    next();
  } catch (e) {
    // Si el token es inválido o ha expirado, respondemos con error 401
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Exportamos el middleware para usarlo en las rutas
module.exports = authMiddleware;
