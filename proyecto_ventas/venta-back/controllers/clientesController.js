const db = require('../config/database');

// ===========================
//    OBTENER TODOS LOS CLIENTES
// ===========================
const obtenerClientes = async (req, res) => {
    try {
        const [clientes] = await db.query(`
            SELECT id_cliente, nombre, apellido, dni, telefono, correo
            FROM cliente
            ORDER BY id_cliente DESC
        `);

        res.json({
            success: true,
            count: clientes.length,
            data: clientes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener los clientes",
            error: error.message
        });
    }
};

// ===========================
//    OBTENER CLIENTE POR ID
// ===========================
const obtenerClientePorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [cliente] = await db.query(
            `SELECT * FROM cliente WHERE id_cliente = ?`,
            [id]
        );

        if (cliente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Cliente no encontrado"
            });
        }

        res.json({
            success: true,
            data: cliente[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener el cliente",
            error: error.message
        });
    }
};

// ===========================
//       CREAR CLIENTE
// ===========================
const crearCliente = async (req, res) => {
    try {
        const { nombre, apellido, dni, telefono, correo } = req.body;

        if (!nombre || !apellido || !dni) {
            return res.status(400).json({
                success: false,
                mensaje: "Nombre, apellido y DNI son obligatorios"
            });
        }

        // Verificar si el DNI ya existe
        const [clienteExistente] = await db.query(
            `SELECT * FROM cliente WHERE dni = ?`,
            [dni]
        );

        if (clienteExistente.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe un cliente con este DNI"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO cliente(nombre, apellido, dni, telefono, correo)
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, apellido, dni, telefono, correo]
        );

        res.status(201).json({
            success: true,
            mensaje: "Cliente creado exitosamente",
            data: { id_cliente: resultado.insertId }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al crear el cliente",
            error: error.message
        });
    }
};

// ===========================
//    ACTUALIZAR CLIENTE
// ===========================
const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, dni, telefono, correo } = req.body;

        const [clienteExistente] = await db.query(
            `SELECT * FROM cliente WHERE id_cliente = ?`,
            [id]
        );

        if (clienteExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Cliente no encontrado"
            });
        }

        // Verificar si el DNI ya existe en otro cliente
        if (dni) {
            const [dniExistente] = await db.query(
                `SELECT * FROM cliente WHERE dni = ? AND id_cliente != ?`,
                [dni, id]
            );

            if (dniExistente.length > 0) {
                return res.status(400).json({
                    success: false,
                    mensaje: "Ya existe otro cliente con este DNI"
                });
            }
        }

        await db.query(
            `UPDATE cliente SET
                nombre = ?, apellido = ?, dni = ?, telefono = ?, correo = ?
             WHERE id_cliente = ?`,
            [nombre, apellido, dni, telefono, correo, id]
        );

        res.json({
            success: true,
            mensaje: "Cliente actualizado exitosamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al actualizar el cliente",
            error: error.message
        });
    }
};

// ===========================
//      ELIMINAR CLIENTE
// ===========================
const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const [clienteExistente] = await db.query(
            `SELECT * FROM cliente WHERE id_cliente = ?`,
            [id]
        );

        if (clienteExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Cliente no encontrado"
            });
        }

        // Verificar si el cliente tiene ventas asociadas
        const [ventas] = await db.query(
            `SELECT COUNT(*) as total FROM venta WHERE id_cliente = ?`,
            [id]
        );

        if (ventas[0].total > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "No se puede eliminar el cliente porque tiene ventas asociadas"
            });
        }

        await db.query(
            `DELETE FROM cliente WHERE id_cliente = ?`,
            [id]
        );

        res.json({
            success: true,
            mensaje: "Cliente eliminado correctamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar el cliente",
            error: error.message
        });
    }
};

// ===========================
//   BUSCAR CLIENTE POR DNI
// ===========================
const buscarClientePorDni = async (req, res) => {
    try {
        const { dni } = req.params;

        const [cliente] = await db.query(
            `SELECT * FROM cliente WHERE dni = ?`,
            [dni]
        );

        if (cliente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Cliente no encontrado"
            });
        }

        res.json({
            success: true,
            data: cliente[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al buscar el cliente",
            error: error.message
        });
    }
};

// ===========================
//   OBTENER CLIENTES ACTIVOS
// ===========================
const obtenerClientesActivos = async (req, res) => {
    try {
        const [clientes] = await db.query(`
            SELECT DISTINCT c.id_cliente, c.nombre, c.apellido, c.dni, 
                   c.telefono, c.correo, COUNT(v.id_venta) as total_compras
            FROM cliente c
            INNER JOIN venta v ON c.id_cliente = v.id_cliente
            GROUP BY c.id_cliente, c.nombre, c.apellido, c.dni, c.telefono, c.correo
            ORDER BY total_compras DESC
        `);

        res.json({
            success: true,
            count: clientes.length,
            data: clientes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener clientes activos",
            error: error.message
        });
    }
};

module.exports = {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientePorDni,
    obtenerClientesActivos
};