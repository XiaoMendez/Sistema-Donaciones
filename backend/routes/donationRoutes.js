const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Crear donación (solo usuarios autenticados)
router.post('/', authMiddleware, donationController.create);

// Listar mis donaciones
router.get('/mine', authMiddleware, donationController.listMine);

// Cambiar estado (solo admin o creador de campaña)
router.put('/:id', authMiddleware, donationController.updateStatus);

module.exports = router;