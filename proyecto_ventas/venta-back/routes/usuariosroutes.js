const express = require('express');
const router = express.Router();
const {
   obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    loginUsuario,
    cambiarPassword,
    obtenerUsuariosActivos
} = require('../controllers/usuariosController');

// RUTAS CRUD
router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;