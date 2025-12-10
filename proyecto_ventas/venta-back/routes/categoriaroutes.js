const express = require('express');
const router = express.Router();
const {
     obtenerCategorias,
    obtenerCategoriaPorId,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    buscarCategoriaPorNombre,
    obtenerCategoriasConProductos
} = require('../controllers/categoriaController');

// RUTAS CRUD
router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoriaPorId);
router.post('/', crearCategoria);
router.put('/:id', actualizarCategoria);
router.delete('/:id', eliminarCategoria);

module.exports = router;