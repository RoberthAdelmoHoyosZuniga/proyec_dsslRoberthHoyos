const express = require('express');
const router = express.Router();
const {
    obtenerVentas,
    obtenerVentaPorId,
    crearVenta,
    actualizarVenta,
    eliminarVenta,
    obtenerVentasPorCliente,
    obtenerVentasPorVendedor,
    obtenerVentasPorCategoria,
    obtenerVentasPorFecha
} = require('../controllers/ventasController');

// RUTAS CRUD
router.get('/', obtenerVentas);
router.get('/:id', obtenerVentaPorId);
router.post('/', crearVenta);
router.put('/:id', actualizarVenta);
router.delete('/:id', eliminarVenta);

// RUTAS ADICIONALES
router.get('/cliente/:idCliente', obtenerVentasPorCliente);
router.get('/vendedor/:idVendedor', obtenerVentasPorVendedor);
router.get('/categoria/:idCategoria', obtenerVentasPorCategoria);
router.get('/reporte/fechas', obtenerVentasPorFecha);

module.exports = router;