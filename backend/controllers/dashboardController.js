// Importamos los modelos necesarios
const Campaign = require('../models/Campaign'); // Modelo de campañas
const Donation = require('../models/Donation'); // Modelo de donaciones
const User = require('../models/User');         // Modelo de usuarios

// =========================
// Estadísticas generales
// =========================
exports.stats = async (req, res) => {
  try {
    // Contar cuántas campañas están activas en la BD
    const activeCampaigns = await Campaign.countDocuments({ estado: 'activa' });
    
    // Contar todas las donaciones registradas
    const totalDonations = await Donation.countDocuments();

    // Top donadores por monto total donado
    // Usamos agregación (aggregate) para sumar las donaciones de cada usuario
    const topDonorsAggregation = await Donation.aggregate([
      {
        // Agrupamos por usuario y sumamos el monto donado
        $group: {
          _id: "$usuario",
          totalDonado: { $sum: "$monto" }
        }
      },
      // Ordenamos de mayor a menor por lo donado
      { $sort: { totalDonado: -1 } },
      // Limitamos a los 3 mejores
      { $limit: 3 },
      {
        // Unimos con la colección de usuarios para traer los nombres
        $lookup: {
          from: "users",            // Nombre de la colección en MongoDB
          localField: "_id",        // ID de usuario en donación
          foreignField: "_id",      // ID en usuarios
          as: "usuarioInfo"         // Guardar resultado en este campo
        }
      },
      {
        // "Desempaquetar" el usuario encontrado (si existe)
        $unwind: {
          path: "$usuarioInfo",
          preserveNullAndEmptyArrays: true // Si no hay usuario, no truena
        }
      },
      {
        // Seleccionar solo los campos que queremos devolver
        $project: {
          _id: 1,
          totalDonado: 1,
          nombre: { $ifNull: ["$usuarioInfo.nombre", "Desconocido"] } // Si no hay nombre, "Desconocido"
        }
      }
    ]);

    // Convertir los datos a una lista de nombres
    const topDonors = topDonorsAggregation.map(d => d.nombre);

    // Enviar respuesta con estadísticas
    res.json({ activeCampaigns, totalDonations, topDonors });
  } catch (err) {
    console.error("Error en stats:", err);
    res.status(500).json({ error: 'Error cargando estadísticas' });
  }
};

// =========================
// Progreso de cada campaña
// =========================
exports.campaignProgress = async (req, res) => {
  try {
    // Obtenemos todas las campañas en la BD
    const campaigns = await Campaign.find({}).lean();

    // Para cada campaña calculamos cuánto lleva recaudado
    const result = await Promise.all(
      campaigns.map(async c => {
        // Todas las donaciones de esa campaña
        const donations = await Donation.find({ campana: c._id });

        // Sumar montos de donaciones
        const recaudado = donations.reduce((sum, d) => sum + d.monto, 0);

        return {
          _id: c._id,
          titulo: c.titulo,
          descripcion: c.descripcion,
          imagen: c.imagen,
          meta: c.metaMonetario || 0, // Si no tiene meta, default 0
          recaudado,
          metaCumplida: recaudado >= (c.metaMonetario || 0), // Si alcanzó meta
          haRecibido: recaudado > 0                         // Si ya recibió algo
        };
      })
    );

    // Agregar URL absoluta de la imagen para que el frontend pueda mostrarla
    const host = `${req.protocol}://${req.get('host')}`;
    result.forEach(c => c.imagenUrl = c.imagen ? `${host}/uploads/${c.imagen}` : null);

    // Enviar respuesta con todas las campañas y su progreso
    res.json(result);
  } catch (err) {
    console.error("Error en campaignProgress:", err);
    res.status(500).json({ error: 'Error cargando progreso de campañas' });
  }
};

// =========================
// Donaciones por categoría
// =========================
exports.donationsByCategory = async (req, res) => {
  try {
    // Buscar todas las donaciones con datos de su campaña
    const donations = await Donation.find({}).populate('campana');

    // Objeto acumulador por categorías
    const categories = {};

    donations.forEach(d => {
      // Tomamos la categoría de la campaña o "Sin categoría"
      const cat = d.campana?.categoria || 'Sin categoría';
      // Sumamos el monto en esa categoría
      categories[cat] = (categories[cat] || 0) + d.monto;
    });

    // Convertimos el objeto en arreglo [{ _id: 'cat', count: total }]
    const result = Object.entries(categories).map(([cat, total]) => ({
      _id: cat,
      count: total
    }));

    res.json(result);
  } catch (err) {
    console.error("Error en donationsByCategory:", err);
    res.status(500).json({ error: 'Error cargando donaciones por categoría' });
  }
};

// =========================
// Donaciones totales por fecha
// =========================
exports.totalDonationsByDate = async (req, res) => {
  try {
    // Usamos agregación para agrupar por fecha y sumar montos
    const donations = await Donation.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } }, // Convertimos fecha a string YYYY-MM-DD
          total: { $sum: "$monto" } // Total por día
        }
      },
      { $sort: { _id: 1 } } // Orden ascendente por fecha
    ]);

    // Convertir formato para el frontend
    const result = donations.map(d => ({
      fecha: d._id,
      total: d.total
    }));

    res.json(result);
  } catch (err) {
    console.error("Error en totalDonationsByDate:", err);
    res.status(500).json({ error: 'Error cargando donaciones por fecha' });
  }
};