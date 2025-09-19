// Importamos los modelos necesarios
const Donation = require('../models/Donation'); // Modelo de donaciones
const Campaign = require('../models/Campaign'); // Modelo de campañas

// =========================
// Crear nueva donación
// =========================
exports.create = async (req, res) => {
  // Extraemos datos del cuerpo de la petición
  const { campana, monto } = req.body;
  try {
    // Verificamos que la campaña exista
    const campaign = await Campaign.findById(campana);
    if (!campaign) return res.status(404).json({ error: 'Campaña no encontrada' });

    // Creamos la donación con el usuario autenticado
    const donation = new Donation({
      monto,              // Monto donado
      campana,            // ID de la campaña
      donante: req.user._id // ID del usuario autenticado
    });

    // Guardamos en la base de datos
    await donation.save();

    // Devolvemos la donación creada
    res.status(201).json(donation);
  } catch (e) {
    // Error inesperado en el servidor
    res.status(500).json({ error: 'Error creando donación' });
  }
};

// =========================
// Listar mis donaciones
// =========================
exports.listMine = async (req, res) => {
  try {
    // Buscamos todas las donaciones hechas por el usuario autenticado
    const donations = await Donation.find({ donante: req.user._id })
      // Traemos info básica de la campaña relacionada
      .populate('campana', 'titulo imagen creador')
      // Ordenamos de más reciente a más antigua
      .sort({ createdAt: -1 });
    
    // Construimos la URL completa de la imagen de la campaña
    const host = `${req.protocol}://${req.get('host')}`;
    const mapped = donations.map(d => ({
      ...d.toObject(),
      imagenUrl: d.campana.imagen ? `${host}/uploads/${d.campana.imagen}` : null
    }));

    // Devolvemos todas las donaciones del usuario
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: 'Error cargando donaciones' });
  }
};

// =========================
// Actualizar estado de una donación
// =========================
exports.updateStatus = async (req, res) => {
  // Estado que se quiere asignar (ej: "aprobada", "rechazada", etc.)
  const { estado } = req.body;
  try {
    // Buscamos la donación por ID y traemos la campaña relacionada
    const donation = await Donation.findById(req.params.id).populate('campana');
    if (!donation) return res.status(404).json({ error: 'Donación no encontrada' });

    // Validamos permisos:
    // - Si el usuario es admin, puede modificar
    // - Si el usuario es el creador de la campaña, también puede
    if (req.user.rol !== 'admin' && String(donation.campana.creador) !== String(req.user._id)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Actualizamos el estado
    donation.estado = estado;
    await donation.save();

    // Respondemos con la donación actualizada
    res.json(donation);
  } catch (e) {
    res.status(500).json({ error: 'Error actualizando estado' });
  }
};
