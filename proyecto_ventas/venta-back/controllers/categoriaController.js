
const db = require('../config/database');

// ===========================
//    OBTENER TODAS LAS CATEGORÍAS
// ===========================
const obtenerCategorias = async (req, res) => {
    try {
        const [categorias] = await db.query(`
            SELECT id_categoria, nombre
            FROM categoria
            ORDER BY id_categoria DESC
        `);

        res.json({
            success: true,
            count: categorias.length,
            data: categorias
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener las categorías",
            error: error.message
        });
    }
};

// ===========================
//    OBTENER CATEGORÍA POR ID
// ===========================
const obtenerCategoriaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [categoria] = await db.query(
            `SELECT id_categoria, nombre 
             FROM categoria 
             WHERE id_categoria = ?`,
            [id]
        );

        if (categoria.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Categoría no encontrada"
            });
        }

        res.json({
            success: true,
            data: categoria[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener la categoría",
            error: error.message
        });
    }
};

// ===========================
//       CREAR CATEGORÍA
// ===========================
const crearCategoria = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                mensaje: "El nombre es obligatorio"
            });
        }

        // Verificar si la categoría ya existe
        const [categoriaExistente] = await db.query(
            `SELECT id_categoria FROM categoria WHERE nombre = ?`,
            [nombre]
        );

        if (categoriaExistente.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe una categoría con este nombre"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO categoria(nombre) VALUES (?)`,
            [nombre]
        );

        res.status(201).json({
            success: true,
            mensaje: "Categoría creada exitosamente",
            data: { id_categoria: resultado.insertId }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al crear la categoría",
            error: error.message
        });
    }
};

// ===========================
//    ACTUALIZAR CATEGORÍA
// ===========================
const actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                mensaje: "El nombre es obligatorio"
            });
        }

        const [categoriaExistente] = await db.query(
            `SELECT id_categoria FROM categoria WHERE id_categoria = ?`,
            [id]
        );

        if (categoriaExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Categoría no encontrada"
            });
        }

        // Verificar si el nombre ya existe en otra categoría
        const [nombreExistente] = await db.query(
            `SELECT id_categoria FROM categoria WHERE nombre = ? AND id_categoria != ?`,
            [nombre, id]
        );

        if (nombreExistente.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe otra categoría con este nombre"
            });
        }

        await db.query(
            `UPDATE categoria SET nombre = ? WHERE id_categoria = ?`,
            [nombre, id]
        );

        res.json({
            success: true,
            mensaje: "Categoría actualizada exitosamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al actualizar la categoría",
            error: error.message
        });
    }
};

// ===========================
//      ELIMINAR CATEGORÍA
// ===========================
const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        const [categoriaExistente] = await db.query(
            `SELECT id_categoria FROM categoria WHERE id_categoria = ?`,
            [id]
        );

        if (categoriaExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Categoría no encontrada"
            });
        }

        // Verificar si la categoría tiene productos asociados
        const [productos] = await db.query(
            `SELECT COUNT(*) as total FROM producto WHERE id_categoria = ?`,
            [id]
        );

        if (productos[0].total > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "No se puede eliminar la categoría porque tiene productos asociados"
            });
        }

        await db.query(
            `DELETE FROM categoria WHERE id_categoria = ?`,
            [id]
        );

        res.json({
            success: true,
            mensaje: "Categoría eliminada correctamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar la categoría",
            error: error.message
        });
    }
};

// ===========================
//   BUSCAR CATEGORÍA POR NOMBRE
// ===========================
const buscarCategoriaPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;

        const [categoria] = await db.query(
            `SELECT id_categoria, nombre 
             FROM categoria 
             WHERE nombre LIKE ?`,
            [`%${nombre}%`]
        );

        if (categoria.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "No se encontraron categorías"
            });
        }

        res.json({
            success: true,
            count: categoria.length,
            data: categoria
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al buscar la categoría",
            error: error.message
        });
    }
};

// ===========================
//   OBTENER CATEGORÍAS CON PRODUCTOS
// ===========================
const obtenerCategoriasConProductos = async (req, res) => {
    try {
        const [categorias] = await db.query(`
            SELECT c.id_categoria, c.nombre, COUNT(p.id_producto) as total_productos
            FROM categoria c
            LEFT JOIN producto p ON c.id_categoria = p.id_categoria
            GROUP BY c.id_categoria, c.nombre
            ORDER BY total_productos DESC
        `);

        res.json({
            success: true,
            count: categorias.length,
            data: categorias
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener categorías con productos",
            error: error.message
        });
    }
};

module.exports = {
    obtenerCategorias,
    obtenerCategoriaPorId,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    buscarCategoriaPorNombre,
    obtenerCategoriasConProductos
};