const db = require('../config/database');

// ===========================
//    OBTENER TODOS LOS MÉTODOS DE PAGO
// ===========================
const obtenerMetodosPago = async (req, res) => {
    try {
        const [metodosPago] = await db.query(`
            SELECT id_pago, nombre
            FROM metodo_pago
            ORDER BY nombre ASC
        `);

        res.json({
            success: true,
            count: metodosPago.length,
            data: metodosPago
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener los métodos de pago",
            error: error.message
        });
    }
};

// ===========================
//    OBTENER MÉTODO DE PAGO POR ID
// ===========================
const obtenerMetodoPagoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [metodoPago] = await db.query(
            `SELECT id_pago, nombre FROM metodo_pago WHERE id_pago = ?`,
            [id]
        );

        if (metodoPago.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Método de pago no encontrado"
            });
        }

        res.json({
            success: true,
            data: metodoPago[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener el método de pago",
            error: error.message
        });
    }
};

// ===========================
//       CREAR MÉTODO DE PAGO
// ===========================
const crearMetodoPago = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                mensaje: "El nombre del método de pago es obligatorio"
            });
        }

        // Verificar si el método de pago ya existe
        const [metodoPagoExistente] = await db.query(
            `SELECT id_pago FROM metodo_pago WHERE nombre = ?`,
            [nombre]
        );

        if (metodoPagoExistente.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe un método de pago con este nombre"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO metodo_pago(nombre) VALUES (?)`,
            [nombre]
        );

        res.status(201).json({
            success: true,
            mensaje: "Método de pago creado exitosamente",
            data: { id_pago: resultado.insertId }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al crear el método de pago",
            error: error.message
        });
    }
};

// ===========================
//    ACTUALIZAR MÉTODO DE PAGO
// ===========================
const actualizarMetodoPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                mensaje: "El nombre del método de pago es obligatorio"
            });
        }

        const [metodoPagoExistente] = await db.query(
            `SELECT id_pago FROM metodo_pago WHERE id_pago = ?`,
            [id]
        );

        if (metodoPagoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Método de pago no encontrado"
            });
        }

        // Verificar si el nuevo nombre ya existe en otro método de pago
        const [nombreExistente] = await db.query(
            `SELECT id_pago FROM metodo_pago WHERE nombre = ? AND id_pago != ?`,
            [nombre, id]
        );

        if (nombreExistente.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe otro método de pago con este nombre"
            });
        }

        await db.query(
            `UPDATE metodo_pago SET nombre = ? WHERE id_pago = ?`,
            [nombre, id]
        );

        res.json({
            success: true,
            mensaje: "Método de pago actualizado exitosamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al actualizar el método de pago",
            error: error.message
        });
    }
};

// ===========================
//      ELIMINAR MÉTODO DE PAGO
// ===========================
const eliminarMetodoPago = async (req, res) => {
    try {
        const { id } = req.params;

        const [metodoPagoExistente] = await db.query(
            `SELECT id_pago FROM metodo_pago WHERE id_pago = ?`,
            [id]
        );

        if (metodoPagoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Método de pago no encontrado"
            });
        }

        // Verificar si el método de pago tiene ventas asociadas
        const [ventas] = await db.query(
            `SELECT COUNT(*) as total FROM venta WHERE id_pago = ?`,
            [id]
        );

        if (ventas[0].total > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "No se puede eliminar el método de pago porque tiene ventas asociadas"
            });
        }

        await db.query(
            `DELETE FROM metodo_pago WHERE id_pago = ?`,
            [id]
        );

        res.json({
            success: true,
            mensaje: "Método de pago eliminado correctamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar el método de pago",
            error: error.message
        });
    }
};

module.exports = {
    obtenerMetodosPago,
    obtenerMetodoPagoPorId,
    crearMetodoPago,
    actualizarMetodoPago,
    eliminarMetodoPago
};