const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');

// Configuración multer para subir avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/'))
      return cb(new Error('Solo imágenes'), false);
    cb(null, true);
  }
});

// Rutas públicas
router.get('/me', userController.me);                // Devuelve info del usuario actual
router.put('/:id', userController.update);          // Actualiza usuario
router.post('/:id/avatar', upload.single('avatar'), userController.uploadAvatar); // Subir avatar

// Rutas administrativas (ahora también públicas, cuidado en producción)
router.get('/', userController.list);               // Lista todos los usuarios
router.delete('/:id', userController.remove);      // Elimina usuario

module.exports = router;