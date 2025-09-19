// Importamos mongoose
const mongoose = require('mongoose');

// Definimos el esquema para la colección "User"
const UserSchema = new mongoose.Schema({
  // Nombre del usuario (obligatorio)
  nombre: { type: String, required: true },

  // Correo electrónico (obligatorio, único, en minúsculas y sin espacios al inicio/final)
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },

  // Contraseña hasheada (obligatoria)
  passwordHash: { type: String, required: true },

  // Rol del usuario: donante / organización / admin (por defecto: donante)
  rol: { type: String, enum: ['donante','organizacion','admin'], default: 'donante' },

  // Avatar del usuario (opcional)
  avatar: { type: String },

  // Fecha de creación del usuario (por defecto: fecha actual)
  createdAt: { type: Date, default: Date.now }
});

// Exportamos el modelo para usarlo en controladores y servicios
module.exports = mongoose.model('User', UserSchema);