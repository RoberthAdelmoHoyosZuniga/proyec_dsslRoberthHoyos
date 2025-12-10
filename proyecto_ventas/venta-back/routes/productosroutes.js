const express = require('express');
const router = express.Router();
const {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProductosPorCategoria,
    obtenerProductosStockBajo,
    buscarProductos,
    actualizarStock,
    obtenerProductosMasVendidos
} = require('../controllers/productosController');

// RUTAS CRUD
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

// RUTAS ADICIONALES
router.get('/categoria/:idCategoria', obtenerProductosPorCategoria);
router.get('/inventario/stock-bajo', obtenerProductosStockBajo);
router.get('/buscar/productos', buscarProductos);
router.patch('/:id/stock', actualizarStock);
router.get('/reportes/mas-vendidos', obtenerProductosMasVendidos);

module.exports = router;