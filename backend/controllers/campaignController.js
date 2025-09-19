// Importamos los modelos de la BD
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

// ======================
// CREAR CAMPAÑA
// ======================
exports.create = async (req, res) => {
  // Extraemos los datos enviados desde el cliente
  const { titulo, descripcion, fechaInicio, fechaFin, metaMonetario } = req.body;
  try {
    // Creamos un objeto Campaign con los datos
    const camp = new Campaign({
      titulo,
      descripcion,
      fechaInicio: fechaInicio || undefined, // opcional
      fechaFin: fechaFin || undefined,       // opcional
      imagen: req.file ? req.file.filename : undefined, // si hay imagen subida
      metaMonetario: metaMonetario || 0,     // si no se envía, por defecto 0
      creador: req.user._id                  // usuario que crea la campaña
    });

    // Guardamos en la BD
    await camp.save();

    res.status(201).json(camp);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creando campaña' });
  }
};

// ======================
// LISTAR CAMPAÑAS (versión básica con filtro)
// ======================
exports.list = async (req, res) => {
  try {
    // Permite filtrar por título con búsqueda parcial
    const search = req.query.search || "";
    const filter = search
      ? { titulo: { $regex: search, $options: "i" } }
      : {};

    // Buscamos campañas, ordenadas por fecha de creación descendente
    const campaigns = await Campaign.find(filter)
      .populate('creador', 'nombre rol') // obtenemos datos básicos del creador
      .sort({ createdAt: -1 });

    const host = `${req.protocol}://${req.get('host')}`;

    // Mapeamos cada campaña para añadir datos extra
    const mapped = campaigns.map(c => {
      const obj = c.toObject();
      obj.imagenUrl = c.imagen ? `${host}/uploads/${c.imagen}` : null;
      obj.canDonate = req.user && req.user.rol === 'donante'; // si puede donar
      obj.canEdit = req.user && (req.user.rol === 'admin' || String(req.user._id) === String(c.creador._id)); // si puede editar
      return obj;
    });

    res.json(mapped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error obteniendo campañas' });
  }
};

// ======================
// OBTENER CAMPAÑA POR ID
// ======================
exports.get = async (req, res) => {
  try {
    // Buscamos campaña por ID
    const c = await Campaign.findById(req.params.id).populate('creador', 'nombre rol');
    if (!c) return res.status(404).json({ error: 'Campaña no encontrada' });

    // Generamos URL completa de la imagen
    c.imagenUrl = c.imagen ? `${req.protocol}://${req.get('host')}/uploads/${c.imagen}` : null;
    res.json(c);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error obteniendo campaña' });
  }
};

// ======================
// ACTUALIZAR CAMPAÑA
// ======================
exports.update = async (req, res) => {
  try {
    const c = await Campaign.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Campaña no encontrada' });

    // Validar permisos: solo admin o creador puede actualizar
    if (req.user.rol !== 'admin' && String(c.creador) !== String(req.user._id)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Actualizamos datos, incluyendo nueva imagen si se subió
    const data = req.body;
    if (req.file) data.imagen = req.file.filename;

    const upd = await Campaign.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(upd);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error actualizando campaña' });
  }
};

// ======================
// ELIMINAR CAMPAÑA
// ======================
exports.remove = async (req, res) => {
  try {
    const c = await Campaign.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Campaña no encontrada' });

    // Validar permisos: solo admin puede borrar
    if (req.user.rol !== 'admin' && String(c.creador) !== String(req.user._id)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Borramos todas las donaciones relacionadas a la campaña
    await Donation.deleteMany({ campana: c._id });
    await c.remove();

    res.json({ msg: 'Campaña eliminada' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error eliminando campaña' });
  }
};

// ======================
// OBTENER DONACIONES DE UNA CAMPAÑA
// ======================
exports.getDonations = async (req, res) => {
  const campaignId = req.params.id;
  try {
    // Buscamos todas las donaciones de esa campaña
    const donations = await Donation.find({ campana: campaignId })
      .populate('donante', 'nombre rol');

    // Formateamos los datos de respuesta
    const mapped = donations.map(d => ({
      _id: d._id,
      usuario: d.donante ? d.donante.nombre : 'Usuario eliminado',
      rol: d.donante ? d.donante.rol : '',
      monto: d.monto,
      fecha: d.createdAt,
      estado: d.estado // pendiente / aceptada / rechazada
    }));

    res.json(mapped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error obteniendo donaciones' });
  }
};

// ======================
// LISTAR CAMPAÑAS (versión extendida con totales aceptados)
// ======================
exports.list = async (req, res) => {
  try {
    // Obtenemos todas las campañas con datos del creador
    const campaigns = await Campaign.find()
      .populate('creador', 'nombre rol')
      .sort({ createdAt: -1 });

    const host = `${req.protocol}://${req.get('host')}`;

    // Calculamos las donaciones aceptadas para cada campaña
    const mapped = await Promise.all(campaigns.map(async c => {
      const obj = c.toObject();

      // Sumamos montos de donaciones aceptadas
      const totalAceptadas = await Donation.aggregate([
        { $match: { campana: c._id, estado: 'aceptada' } },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]);

      obj.imagenUrl = c.imagen ? `${host}/uploads/${c.imagen}` : null;
      obj.canDonate = req.user && req.user.rol === 'donante';
      obj.canEdit = req.user && (req.user.rol === 'admin' || String(req.user._id) === String(c.creador._id));
      obj.totalDonacionesAceptadas = totalAceptadas.length ? totalAceptadas[0].total : 0;

      // Incluimos id del creador explícitamente
      obj.creadorId = c.creador ? String(c.creador._id) : null;

      return obj;
    }));

    res.json(mapped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error obteniendo campañas' });
  }
};