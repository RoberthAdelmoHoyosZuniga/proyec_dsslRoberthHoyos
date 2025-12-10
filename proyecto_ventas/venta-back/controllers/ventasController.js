const db = require('../config/database');

// ===========================
//    OBTENER TODAS LAS VENTAS
// ===========================
const obtenerVentas = async (req, res) => {
    try {
        const [ventas] = await db.query(`
            SELECT v.id_venta, v.fecha, v.total,
                   c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.dni,
                   u.nombre AS vendedor,
                   mp.nombre AS metodo_pago
            FROM venta v
            INNER JOIN cliente c ON v.id_cliente = c.id_cliente
            INNER JOIN usuario u ON v.id_usuario = u.id_usuario
            INNER JOIN metodo_pago mp ON v.id_pago = mp.id_pago
            ORDER BY v.id_venta DESC
        `);

        res.json({
            success: true,
            count: ventas.length,
            data: ventas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener las ventas",
            error: error.message
        });
    }
};

// ===========================
//    OBTENER VENTA POR ID
// ===========================
const obtenerVentaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener información general de la venta
        const [venta] = await db.query(`
            SELECT v.id_venta, v.fecha, v.total,
                   c.id_cliente, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, 
                   c.dni, c.telefono, c.correo,
                   u.id_usuario, u.nombre AS vendedor,
                   mp.id_pago, mp.nombre AS metodo_pago
            FROM venta v
            INNER JOIN cliente c ON v.id_cliente = c.id_cliente
            INNER JOIN usuario u ON v.id_usuario = u.id_usuario
            INNER JOIN metodo_pago mp ON v.id_pago = mp.id_pago
            WHERE v.id_venta = ?
        `, [id]);

        if (venta.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Venta no encontrada"
            });
        }

        // Obtener detalle de la venta
        const [detalles] = await db.query(`
            SELECT dv.id_detalle, dv.cantidad, dv.precio_unitario, dv.subtotal,
                   p.id_producto, p.nombre AS producto
            FROM detalle_venta dv
            INNER JOIN producto p ON dv.id_producto = p.id_producto
            WHERE dv.id_venta = ?
        `, [id]);

        res.json({
            success: true,
            data: {
                ...venta[0],
                detalles: detalles
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener la venta",
            error: error.message
        });
    }
};

// ===========================
//       CREAR VENTA
// ===========================
const crearVenta = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const {
            id_cliente,
            id_usuario,
            id_pago,
            total,
            detalles  // Array de productos: [{id_producto, cantidad, precio_unitario}]
        } = req.body;

        // Validaciones
        if (!id_cliente || !id_usuario || !id_pago) {
            return res.status(400).json({
                success: false,
                mensaje: "Cliente, usuario y método de pago son obligatorios"
            });
        }

        if (!detalles || detalles.length === 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Debe incluir al menos un producto en la venta"
            });
        }

        await connection.beginTransaction();

        // Insertar venta
        const [resultadoVenta] = await connection.query(
            `INSERT INTO venta(id_cliente, id_usuario, id_pago, total)
             VALUES (?, ?, ?, ?)`,
            [id_cliente, id_usuario, id_pago, total]
        );

        const id_venta = resultadoVenta.insertId;

        // Insertar detalles y actualizar stock
        for (const detalle of detalles) {
            const { id_producto, cantidad, precio_unitario } = detalle;
            const subtotal = cantidad * precio_unitario;

            // Verificar stock disponible
            const [producto] = await connection.query(
                `SELECT stock FROM producto WHERE id_producto = ?`,
                [id_producto]
            );

            if (producto.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    mensaje: `Producto con ID ${id_producto} no encontrado`
                });
            }

            if (producto[0].stock < cantidad) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    mensaje: `Stock insuficiente para el producto ID ${id_producto}. Stock disponible: ${producto[0].stock}`
                });
            }

            // Insertar detalle de venta
            await connection.query(
                `INSERT INTO detalle_venta(id_venta, id_producto, cantidad, precio_unitario, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                [id_venta, id_producto, cantidad, precio_unitario, subtotal]
            );

            // Actualizar stock del producto
            await connection.query(
                `UPDATE producto SET stock = stock - ? WHERE id_producto = ?`,
                [cantidad, id_producto]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            mensaje: "Venta creada exitosamente",
            data: { id_venta }
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            mensaje: "Error al crear la venta",
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// ===========================
//    ACTUALIZAR VENTA
// ===========================
const actualizarVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_cliente, id_usuario, id_pago, total } = req.body;

        const [ventaExistente] = await db.query(
            `SELECT * FROM venta WHERE id_venta = ?`,
            [id]
        );

        if (ventaExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Venta no encontrada"
            });
        }

        await db.query(
            `UPDATE venta SET
                id_cliente = ?, id_usuario = ?, id_pago = ?, total = ?
             WHERE id_venta = ?`,
            [id_cliente, id_usuario, id_pago, total, id]
        );

        res.json({
            success: true,
            mensaje: "Venta actualizada exitosamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al actualizar la venta",
            error: error.message
        });
    }
};

// ===========================
//      ELIMINAR VENTA
// ===========================
const eliminarVenta = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { id } = req.params;

        const [ventaExistente] = await connection.query(
            `SELECT * FROM venta WHERE id_venta = ?`,
            [id]
        );

        if (ventaExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Venta no encontrada"
            });
        }

        await connection.beginTransaction();

        // Obtener detalles para devolver el stock
        const [detalles] = await connection.query(
            `SELECT id_producto, cantidad FROM detalle_venta WHERE id_venta = ?`,
            [id]
        );

        // Devolver stock
        for (const detalle of detalles) {
            await connection.query(
                `UPDATE producto SET stock = stock + ? WHERE id_producto = ?`,
                [detalle.cantidad, detalle.id_producto]
            );
        }

        // Eliminar detalles de venta
        await connection.query(
            `DELETE FROM detalle_venta WHERE id_venta = ?`,
            [id]
        );

        // Eliminar venta
        await connection.query(
            `DELETE FROM venta WHERE id_venta = ?`,
            [id]
        );

        await connection.commit();

        res.json({
            success: true,
            mensaje: "Venta eliminada correctamente y stock devuelto"
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar la venta",
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// ===========================
//   VENTAS POR CLIENTE
// ===========================
const obtenerVentasPorCliente = async (req, res) => {
    try {
        const { idCliente } = req.params;

        const [ventas] = await db.query(`
            SELECT v.id_venta, v.fecha, v.total,
                   c.nombre, c.apellido, c.dni,
                   u.nombre AS vendedor,
                   mp.nombre AS metodo_pago
            FROM venta v
            INNER JOIN cliente c ON v.id_cliente = c.id_cliente
            INNER JOIN usuario u ON v.id_usuario = u.id_usuario
            INNER JOIN metodo_pago mp ON v.id_pago = mp.id_pago
            WHERE v.id_cliente = ?
            ORDER BY v.fecha DESC
        `, [idCliente]);

        res.json({
            success: true,
            count: ventas.length,
            data: ventas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener ventas por cliente",
            error: error.message
        });
    }
};

// ===========================
//   VENTAS POR VENDEDOR
// ===========================
const obtenerVentasPorVendedor = async (req, res) => {
    try {
        const { idVendedor } = req.params;

        const [ventas] = await db.query(`
            SELECT v.id_venta, v.fecha, v.total,
                   c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
                   u.nombre AS vendedor,
                   mp.nombre AS metodo_pago
            FROM venta v
            INNER JOIN cliente c ON v.id_cliente = c.id_cliente
            INNER JOIN usuario u ON v.id_usuario = u.id_usuario
            INNER JOIN metodo_pago mp ON v.id_pago = mp.id_pago
            WHERE v.id_usuario = ?
            ORDER BY v.fecha DESC
        `, [idVendedor]);

        res.json({
            success: true,
            count: ventas.length,
            data: ventas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener ventas por vendedor",
            error: error.message
        });
    }
};

// ===========================
//   VENTAS POR CATEGORÍA
// ===========================
const obtenerVentasPorCategoria = async (req, res) => {
    try {
        const { idCategoria } = req.params;

        const [ventas] = await db.query(`
            SELECT DISTINCT v.id_venta, v.fecha, v.total,
                   c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
                   cat.nombre AS categoria
            FROM venta v
            INNER JOIN detalle_venta dv ON v.id_venta = dv.id_venta
            INNER JOIN producto p ON dv.id_producto = p.id_producto
            INNER JOIN categoria cat ON p.id_categoria = cat.id_categoria
            INNER JOIN cliente c ON v.id_cliente = c.id_cliente
            WHERE cat.id_categoria = ?
            ORDER BY v.fecha DESC
        `, [idCategoria]);

        res.json({
            success: true,
            count: ventas.length,
            data: ventas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener ventas por categoría",
            error: error.message
        });
    }
};

// ===========================
//   REPORTE DE VENTAS POR FECHA
// ===========================
const obtenerVentasPorFecha = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        let query = `
            SELECT v.id_venta, v.fecha, v.total,
                   c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
                   u.nombre AS vendedor,
                   mp.nombre AS metodo_pago
            FROM venta v
            INNER JOIN cliente c ON v.id_cliente = c.id_cliente
            INNER JOIN usuario u ON v.id_usuario = u.id_usuario
            INNER JOIN metodo_pago mp ON v.id_pago = mp.id_pago
        `;

        const params = [];

        if (fechaInicio && fechaFin) {
            query += ` WHERE DATE(v.fecha) BETWEEN ? AND ?`;
            params.push(fechaInicio, fechaFin);
        } else if (fechaInicio) {
            query += ` WHERE DATE(v.fecha) >= ?`;
            params.push(fechaInicio);
        } else if (fechaFin) {
            query += ` WHERE DATE(v.fecha) <= ?`;
            params.push(fechaFin);
        }

        query += ` ORDER BY v.fecha DESC`;

        const [ventas] = await db.query(query, params);

        // Calcular totales
        const totalVentas = ventas.reduce((sum, venta) => sum + parseFloat(venta.total), 0);

        res.json({
            success: true,
            count: ventas.length,
            totalVentas: totalVentas.toFixed(2),
            data: ventas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener ventas por fecha",
            error: error.message
        });
    }
};

module.exports = {
    obtenerVentas,
    obtenerVentaPorId,
    crearVenta,
    actualizarVenta,
    eliminarVenta,
    obtenerVentasPorCliente,
    obtenerVentasPorVendedor,
    obtenerVentasPorCategoria,
    obtenerVentasPorFecha
};