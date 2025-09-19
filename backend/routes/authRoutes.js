// Importamos express y express-validator
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Importamos el controlador de autenticación
const authController = require('../controllers/authController');

// =========================
// RUTA DE REGISTRO
// =========================
router.post('/register', [
  // Validaciones:
  body('nombre').notEmpty().withMessage('Nombre requerido'), // Nombre obligatorio
  body('email').isEmail().withMessage('Email inválido'), // Email debe ser válido
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres') // Contraseña mínima
], authController.register); // Llamamos al controlador

// =========================
// RUTA DE LOGIN
// =========================
router.post('/login', authController.login);

// Exportamos el router para usarlo en app.js o server.js
module.exports = router;