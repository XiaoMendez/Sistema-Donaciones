// controllers/authController.js

// Importamos funciones y librerías necesarias:
const { validationResult } = require('express-validator'); // Para validar los datos que llegan en la request
const bcrypt = require('bcryptjs'); // Para encriptar y comparar contraseñas
const jwt = require('jsonwebtoken'); // Para generar y verificar tokens JWT
const User = require('../models/User'); // Modelo de usuarios en MongoDB

// ============================
// Registro de usuario
// ============================
exports.register = async (req, res) => {
  // Validaciones de los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) 
    // Si hay errores, se devuelve el primer error encontrado
    return res.status(400).json({ error: errors.array()[0].msg });

  // Extraemos datos del cuerpo de la petición
  const { nombre, email, password, rol, adminCode } = req.body;

  try {
    // Si el usuario quiere registrarse como admin,
    // verificamos que envíe el código correcto
    if (rol === 'admin' && adminCode !== process.env.ADMIN_ACCESS_CODE) {
      return res.status(400).json({ error: 'Código admin inválido' });
    }

    // Revisamos si ya existe un usuario con el mismo email
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ error: 'Email ya registrado' });

    // Encriptamos la contraseña antes de guardarla
    const hashed = await bcrypt.hash(password, 10);

    // Creamos un nuevo usuario con los datos recibidos
    const user = new User({ 
      nombre, 
      email, 
      passwordHash: hashed, // Guardamos la contraseña encriptada
      rol 
    });

    // Guardamos el usuario en la base de datos
    await user.save();

    // Respondemos con éxito y devolvemos algunos datos del usuario
    res.status(201).json({ 
      msg: 'Usuario creado', 
      user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol } 
    });
  } catch (e) {
    // Capturamos cualquier error en el proceso
    console.error('ERROR REGISTRO:', e);
    res.status(500).json({ error: 'Error en servidor' });
  }
};

// ============================
// Inicio de sesión
// ============================
exports.login = async (req, res) => {
  // Extraemos email y password del body
  const { email, password } = req.body;
  try {
    // Buscamos el usuario en la base de datos por email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    // Comparamos la contraseña ingresada con la encriptada en BD
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Contraseña incorrecta' });

    // Creamos un token JWT con la info del usuario (id y rol)
    const token = jwt.sign(
      { id: user._id, rol: user.rol }, // payload
      process.env.JWT_SECRET,          // clave secreta
      { expiresIn: '2h' }              // duración del token
    );

    // Enviamos respuesta con el token y datos del usuario
    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        avatar: user.avatar // opcional, si tiene avatar
      }
    });
  } catch (e) {
    // Capturamos errores y devolvemos un mensaje genérico
    console.error('ERROR LOGIN:', e);
    res.status(500).json({ error: 'Error en servidor' });
  }
};