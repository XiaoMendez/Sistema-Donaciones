// Importamos mongoose
const mongoose = require('mongoose');

// Definimos el esquema para la colección "Donation"
const DonationSchema = new mongoose.Schema({
  // Monto donado (obligatorio)
  monto: { type: Number, required: true },

  // Estado de la donación: pendiente / aceptada / rechazada (por defecto: pendiente)
  estado: { type: String, enum: ['pendiente','aceptada','rechazada'], default: 'pendiente' },

  // Relación con la campaña a la que se dona (obligatorio)
  campana: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },

  // Relación con el usuario que hace la donación (obligatorio)
  donante: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Fecha de creación de la donación (por defecto: fecha actual)
  createdAt: { type: Date, default: Date.now }
});

// Exportamos el modelo para usarlo en controladores y servicios
module.exports = mongoose.model('Donation', DonationSchema);