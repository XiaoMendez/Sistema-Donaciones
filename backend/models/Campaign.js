// Importamos mongoose para definir el esquema de la colección
const mongoose = require('mongoose');

// Definimos el esquema para la colección "Campaign"
const CampaignSchema = new mongoose.Schema({
  // Título de la campaña (obligatorio)
  titulo: { type: String, required: true },

  // Descripción de la campaña (obligatoria)
  descripcion: { type: String, required: true },

  // URL o ruta de la imagen representativa de la campaña (opcional)
  imagen: { type: String },

  // Fecha de inicio de la campaña (por defecto la fecha actual)
  fechaInicio: { type: Date, default: Date.now },

  // Fecha de finalización de la campaña (puede quedar nula si no se define)
  fechaFin: { type: Date },

  // Estado de la campaña (solo puede ser "activa" o "finalizada") — valor por defecto: "activa"
  estado: { type: String, enum: ['activa','finalizada'], default: 'activa' },

  // Relación con el modelo User (el creador de la campaña, obligatorio)
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Meta monetaria que se quiere alcanzar con la campaña (por defecto 0)
  metaMonetario: { type: Number, default: 0 },

  // Fecha de creación del registro (por defecto la fecha actual)
  createdAt: { type: Date, default: Date.now }
});

// 🔹 Virtual: total de donaciones aceptadas en la campaña
// (este valor no se guarda en MongoDB, se calcula dinámicamente o se asigna en runtime)
CampaignSchema.virtual('totalDonacionesAceptadas').get(function() {
  return this._totalDonacionesAceptadas || 0;
});

// 🔹 Virtual: número de donaciones realizadas a la campaña
CampaignSchema.virtual('numeroDonaciones').get(function() {
  return this._numeroDonaciones || 0;
});

// Configuración para que los virtuals se incluyan cuando se convierta a JSON u objeto
CampaignSchema.set('toJSON', { virtuals: true });
CampaignSchema.set('toObject', { virtuals: true });

// Exportamos el modelo para usarlo en controladores y servicios
module.exports = mongoose.model('Campaign', CampaignSchema);