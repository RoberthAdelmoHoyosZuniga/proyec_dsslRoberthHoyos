const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    registrarUsuario,
    login,
    obtenerPerfil,
    verificarToken
} = require('../controllers/authController');
const { verificarToken: middlewareToken } = require('../middleware/authMiddleware');

// Validaciones para registro
const validacionRegistro = [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Validaciones para login
const validacionLogin = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

// Rutas públicas
router.post('/registro', validacionRegistro, registrarUsuario);
router.post('/login', validacionLogin, login);

// Rutas protegidas (requieren token JWT)
router.get('/perfil', middlewareToken, obtenerPerfil);
router.get('/verificar', middlewareToken, verificarToken);

module.exports = router;