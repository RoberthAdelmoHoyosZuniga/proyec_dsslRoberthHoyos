const express = require('express');
const router = express.Router();
const {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientePorDni,
    obtenerClientesActivos
} = require('../controllers/clientesController');

// RUTAS CRUD
router.get('/', obtenerClientes);
router.get('/:id', obtenerClientePorId);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarCliente);

// RUTAS ADICIONALES
router.get('/buscar/dni/:dni', buscarClientePorDni);
router.get('/activos/lista', obtenerClientesActivos);

module.exports = router;