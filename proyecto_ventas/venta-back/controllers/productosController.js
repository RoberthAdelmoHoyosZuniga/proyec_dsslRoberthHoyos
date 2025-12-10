const db = require('../config/database');

// ===========================
//    OBTENER TODOS LOS PRODUCTOS
// ===========================
const obtenerProductos = async (req, res) => {
    try {
        const [productos] = await db.query(`
            SELECT p.id_producto, p.nombre, p.precio, p.stock,
                   c.id_categoria, c.nombre AS categoria
            FROM producto p
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria
            ORDER BY p.id_producto DESC
        `);

        res.json({
            success: true,
            count: productos.length,
            data: productos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener los productos",
            error: error.message
        });
    }
};

// ===========================
//    OBTENER PRODUCTO POR ID
// ===========================
const obtenerProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [producto] = await db.query(`
            SELECT p.id_producto, p.nombre, p.precio, p.stock,
                   c.id_categoria, c.nombre AS categoria
            FROM producto p
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.id_producto = ?
        `, [id]);

        if (producto.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Producto no encontrado"
            });
        }

        res.json({
            success: true,
            data: producto[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener el producto",
            error: error.message
        });
    }
};

// ===========================
//       CREAR PRODUCTO
// ===========================
const crearProducto = async (req, res) => {
    try {
        const { nombre, precio, stock, id_categoria } = req.body;

        if (!nombre || !precio || !id_categoria) {
            return res.status(400).json({
                success: false,
                mensaje: "Nombre, precio y categoría son obligatorios"
            });
        }

        if (precio <= 0) {
            return res.status(400).json({
                success: false,
                mensaje: "El precio debe ser mayor a 0"
            });
        }

        if (stock < 0) {
            return res.status(400).json({
                success: false,
                mensaje: "El stock no puede ser negativo"
            });
        }

        const [categoria] = await db.query(
            `SELECT * FROM categoria WHERE id_categoria = ?`,
            [id_categoria]
        );

        if (categoria.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "La categoría especificada no existe"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO producto(nombre, precio, stock, id_categoria)
             VALUES (?, ?, ?, ?)`,
            [nombre, precio, stock || 0, id_categoria]
        );

        res.status(201).json({
            success: true,
            mensaje: "Producto creado exitosamente",
            data: { id_producto: resultado.insertId }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al crear el producto",
            error: error.message
        });
    }
};

// ===========================
//    ACTUALIZAR PRODUCTO
// ===========================
const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, stock, id_categoria } = req.body;

        const [productoExistente] = await db.query(
            `SELECT * FROM producto WHERE id_producto = ?`,
            [id]
        );

        if (productoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Producto no encontrado"
            });
        }

        if (precio !== undefined && precio <= 0) {
            return res.status(400).json({
                success: false,
                mensaje: "El precio debe ser mayor a 0"
            });
        }

        if (stock !== undefined && stock < 0) {
            return res.status(400).json({
                success: false,
                mensaje: "El stock no puede ser negativo"
            });
        }

        if (id_categoria) {
            const [categoria] = await db.query(
                `SELECT * FROM categoria WHERE id_categoria = ?`,
                [id_categoria]
            );

            if (categoria.length === 0) {
                return res.status(404).json({
                    success: false,
                    mensaje: "La categoría especificada no existe"
                });
            }
        }

        await db.query(
            `UPDATE producto SET
                nombre = ?, precio = ?, stock = ?, id_categoria = ?
             WHERE id_producto = ?`,
            [nombre, precio, stock, id_categoria, id]
        );

        res.json({
            success: true,
            mensaje: "Producto actualizado exitosamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al actualizar el producto",
            error: error.message
        });
    }
};

// ===========================
//      ELIMINAR PRODUCTO
// ===========================
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const [productoExistente] = await db.query(
            `SELECT * FROM producto WHERE id_producto = ?`,
            [id]
        );

        if (productoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Producto no encontrado"
            });
        }

        const [ventas] = await db.query(
            `SELECT COUNT(*) as total FROM detalle_venta WHERE id_producto = ?`,
            [id]
        );

        if (ventas[0].total > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "No se puede eliminar el producto porque tiene ventas asociadas"
            });
        }

        await db.query(
            `DELETE FROM producto WHERE id_producto = ?`,
            [id]
        );

        res.json({
            success: true,
            mensaje: "Producto eliminado correctamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar el producto",
            error: error.message
        });
    }
};

// ===========================
//   PRODUCTOS POR CATEGORÍA
// ===========================
const obtenerProductosPorCategoria = async (req, res) => {
    try {
        const { idCategoria } = req.params;

        const [productos] = await db.query(`
            SELECT p.id_producto, p.nombre, p.precio, p.stock,
                   c.nombre AS categoria
            FROM producto p
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.id_categoria = ?
            ORDER BY p.nombre
        `, [idCategoria]);

        res.json({
            success: true,
            count: productos.length,
            data: productos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener productos por categoría",
            error: error.message
        });
    }
};

// ===========================
//   PRODUCTOS CON STOCK BAJO
// ===========================
const obtenerProductosStockBajo = async (req, res) => {
    try {
        const { minimo } = req.query;
        const stockMinimo = minimo || 10;

        const [productos] = await db.query(`
            SELECT p.id_producto, p.nombre, p.precio, p.stock,
                   c.nombre AS categoria
            FROM producto p
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.stock <= ?
            ORDER BY p.stock ASC
        `, [stockMinimo]);

        res.json({
            success: true,
            count: productos.length,
            stockMinimo: parseInt(stockMinimo),
            data: productos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener productos con stock bajo",
            error: error.message
        });
    }
};

// ===========================
//   BUSCAR PRODUCTOS
// ===========================
const buscarProductos = async (req, res) => {
    try {
        const { termino } = req.query;

        if (!termino) {
            return res.status(400).json({
                success: false,
                mensaje: "Debe proporcionar un término de búsqueda"
            });
        }

        const [productos] = await db.query(`
            SELECT p.id_producto, p.nombre, p.precio, p.stock,
                   c.nombre AS categoria
            FROM producto p
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.nombre LIKE ? OR c.nombre LIKE ?
            ORDER BY p.nombre
        `, [`%${termino}%`, `%${termino}%`]);

        res.json({
            success: true,
            count: productos.length,
            termino: termino,
            data: productos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al buscar productos",
            error: error.message
        });
    }
};

// ===========================
//   ACTUALIZAR STOCK
// ===========================
const actualizarStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad, operacion } = req.body;

        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Debe proporcionar una cantidad válida"
            });
        }

        if (!operacion || !['sumar', 'restar'].includes(operacion)) {
            return res.status(400).json({
                success: false,
                mensaje: "La operación debe ser 'sumar' o 'restar'"
            });
        }

        const [productoExistente] = await db.query(
            `SELECT stock FROM producto WHERE id_producto = ?`,
            [id]
        );

        if (productoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Producto no encontrado"
            });
        }

        if (operacion === 'restar' && productoExistente[0].stock < cantidad) {
            return res.status(400).json({
                success: false,
                mensaje: `Stock insuficiente. Stock actual: ${productoExistente[0].stock}`
            });
        }

        const operador = operacion === 'sumar' ? '+' : '-';
        
        await db.query(
            `UPDATE producto SET stock = stock ${operador} ? WHERE id_producto = ?`,
            [cantidad, id]
        );

        const [productoActualizado] = await db.query(
            `SELECT stock FROM producto WHERE id_producto = ?`,
            [id]
        );

        res.json({
            success: true,
            mensaje: `Stock ${operacion === 'sumar' ? 'incrementado' : 'decrementado'} exitosamente`,
            stockActual: productoActualizado[0].stock
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al actualizar el stock",
            error: error.message
        });
    }
};

// ===========================
//   PRODUCTOS MÁS VENDIDOS
// ===========================
const obtenerProductosMasVendidos = async (req, res) => {
    try {
        const { limite } = req.query;
        const limiteProductos = limite || 10;

        const [productos] = await db.query(`
            SELECT p.id_producto, p.nombre, p.precio, p.stock,
                   c.nombre AS categoria,
                   SUM(dv.cantidad) AS total_vendido,
                   SUM(dv.subtotal) AS ingresos_generados
            FROM detalle_venta dv
            INNER JOIN producto p ON dv.id_producto = p.id_producto
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria
            GROUP BY p.id_producto, p.nombre, p.precio, p.stock, c.nombre
            ORDER BY total_vendido DESC
            LIMIT ?
        `, [parseInt(limiteProductos)]);

        res.json({
            success: true,
            count: productos.length,
            data: productos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener productos más vendidos",
            error: error.message
        });
    }
};

module.exports = {
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
};