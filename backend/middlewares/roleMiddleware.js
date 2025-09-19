// Middleware para verificar roles y permisos adicionales

// 🔹 allowRoles: genera un middleware que solo permite el acceso a ciertos roles
function allowRoles(...roles) {
  // Retorna una función middleware
  return (req, res, next) => {
    // Si no hay usuario autenticado en la request, error 401
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });

    // Si el rol del usuario no está en la lista de roles permitidos → error 403
    if (!roles.includes(req.user.rol)) return res.status(403).json({ error: 'No autorizado' });

    // Si pasa la validación, se ejecuta el siguiente middleware/controlador
    next();
  };
}

// 🔹 isOwnerOrAdmin: permite acceso solo si el usuario es el dueño del recurso o es admin
function isOwnerOrAdmin(getResourceUserId) {
  /*
    getResourceUserId: función que recibe el objeto `req` 
    y debe retornar el ID del usuario dueño del recurso.
    Ejemplo: (req) => req.params.userId
  */
  return (req, res, next) => {
    // Si el usuario es admin, puede acceder sin restricciones
    if (req.user.rol === 'admin') return next();

    // Obtiene el ID del dueño del recurso
    const ownerId = getResourceUserId(req);

    // Si no existe el recurso → error 404
    if (!ownerId) return res.status(404).json({ error: 'Recurso no encontrado' });

    // Si el ID del dueño no coincide con el ID del usuario autenticado → error 403
    if (String(ownerId) !== String(req.user._id)) return res.status(403).json({ error: 'No autorizado' });

    // Si pasa las validaciones, sigue con el flujo
    next();
  };
}

// Exporta las funciones para usarlas en rutas/controladores
module.exports = { allowRoles, isOwnerOrAdmin };