// Importamos bcrypt para el manejo de contraseñas seguras
const bcrypt = require('bcryptjs');
// Importamos el modelo de usuario
const User = require('../models/User');

// =========================
// Obtener información del usuario autenticado
// =========================
exports.me = async (req, res) => {
  // Si req.user existe (lo asigna el middleware de autenticación), devolvemos ese usuario
  // Si no existe (no está logueado), devolvemos null
  res.json(req.user || null);
};

// =========================
// Actualizar datos del usuario
// =========================
exports.update = async (req, res) => {
  // Extraemos nombre y password del body
  const { nombre, password } = req.body;
  const data = {};

  // Si se envía un nuevo nombre, lo guardamos
  if (nombre) data.nombre = nombre;

  // Si se envía un nuevo password, lo hasheamos antes de guardarlo
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  try {
    // Actualizamos el usuario por su ID y devolvemos el documento actualizado
    // select('-passwordHash') → excluimos la contraseña en la respuesta
    const upd = await User.findByIdAndUpdate(req.params.id, data, { new: true }).select('-passwordHash');
    res.json(upd);
  } catch (e) {
    console.error('ERROR UPDATE USER:', e);
    res.status(500).json({ error: 'Error actualizando' });
  }
};

// =========================
// Subir avatar del usuario
// =========================
exports.uploadAvatar = async (req, res) => {
  // Verificamos que se haya enviado un archivo
  if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });

  try {
    // Si el usuario está logueado, asignamos el nombre del archivo a su campo avatar
    if (req.user) req.user.avatar = req.file.filename;

    // Guardamos el usuario con el nuevo avatar
    await (req.user ? req.user.save() : null);

    res.json({ msg: 'Avatar actualizado', avatar: req.file.filename });
  } catch (e) {
    console.error('ERROR AVATAR:', e);
    res.status(500).json({ error: 'Error al subir avatar' });
  }
};

// =========================
// Listar todos los usuarios
// =========================
exports.list = async (req, res) => {
  try {
    // Obtenemos todos los usuarios pero ocultamos el campo de contraseña
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (e) {
    console.error('ERROR LIST USERS:', e);
    res.status(500).json({ error: 'Error listando usuarios' });
  }
};

// =========================
// Eliminar usuario por ID
// =========================
exports.remove = async (req, res) => {
  try {
    // Eliminamos el usuario por su ID
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Usuario eliminado' });
  } catch (e) {
    console.error('ERROR DELETE USER:', e);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
};