// Importamos la librería mongoose, que nos permite trabajar con MongoDB en Node.js
const mongoose = require('mongoose');

// Exportamos una función asíncrona llamada "conectarDB"
// Esta función se encargará de establecer la conexión con la base de datos
module.exports = async function conectarDB() {
  try {
    // Intentamos conectar a MongoDB usando la URI guardada en la variable de entorno MONGO_URI
    // El segundo parámetro (objeto vacío {}) es donde normalmente se colocan opciones de configuración
    await mongoose.connect(process.env.MONGO_URI, {
      // Aquí podrías poner opciones como: useNewUrlParser: true, useUnifiedTopology: true, etc.
    });

    // Si la conexión es exitosa, mostramos un mensaje en la consola
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    // Si ocurre algún error al conectar, lo mostramos en consola
    console.error('❌ Error MongoDB:', err.message);

    // Finalizamos el proceso con un código de error (1) para indicar que algo salió mal
    process.exit(1);
  }
};