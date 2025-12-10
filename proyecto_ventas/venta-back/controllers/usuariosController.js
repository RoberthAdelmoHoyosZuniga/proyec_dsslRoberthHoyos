const db = require('../config/database');
const bcrypt = require('bcryptjs');

// ===========================
//    OBTENER TODOS LOS USUARIOS
// ===========================
const obtenerUsuarios = async (req, res) => {
    try {
        const [usuarios] = await db.query(`
            SELECT id_usuario, nombre, usuario, rol
            FROM usuario
            ORDER BY id_usuario DESC
        `);

        res.json({
            success: true,
            count: usuarios.length,
            data: usuarios
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener los usuarios",
            error: error.message
        });
    }
};

// ===========================
//    OBTENER USUARIO POR ID
// ===========================
const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [usuario] = await db.query(
            `SELECT id_usuario, nombre, usuario, rol
             FROM usuario 
             WHERE id_usuario = ?`,
            [id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        res.json({
            success: true,
            data: usuario[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener el usuario",
            error: error.message
        });
    }
};

// ===========================
//       CREAR USUARIO
// ===========================
const crearUsuario = async (req, res) => {
    try {
        const { nombre, usuario, password, rol } = req.body;

        if (!nombre || !usuario || !password) {
            return res.status(400).json({
                success: false,
                mensaje: "Nombre, usuario y contraseña son obligatorios"
            });
        }

        // Verificar si el usuario ya existe
        const [usuarioExistente] = await db.query(
            `SELECT id_usuario FROM usuario WHERE usuario = ?`,
            [usuario]
        );

        if (usuarioExistente.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe un usuario con este nombre de usuario"
            });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [resultado] = await db.query(
            `INSERT INTO usuario(nombre, usuario, password, rol)
             VALUES (?, ?, ?, ?)`,
            [nombre, usuario, passwordHash, rol || 'vendedor']
        );

        res.status(201).json({
            success: true,
            mensaje: "Usuario creado exitosamente",
            data: { id_usuario: resultado.insertId }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al crear el usuario",
            error: error.message
        });
    }
};

// ===========================
//    ACTUALIZAR USUARIO
// ===========================
const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, usuario, password, rol } = req.body;

        if (!nombre || !usuario) {
            return res.status(400).json({
                success: false,
                mensaje: "Nombre y usuario son obligatorios"
            });
        }

        const [usuarioExistente] = await db.query(
            `SELECT id_usuario FROM usuario WHERE id_usuario = ?`,
            [id]
        );

        if (usuarioExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        // Verificar si el nombre de usuario ya existe en otro usuario
        const [usuarioNombreExistente] = await db.query(
            `SELECT id_usuario FROM usuario WHERE usuario = ? AND id_usuario != ?`,
            [usuario, id]
        );

        if (usuarioNombreExistente.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe otro usuario con este nombre de usuario"
            });
        }

        // Si se proporciona nueva contraseña, encriptarla
        let updateQuery = `UPDATE usuario SET nombre = ?, usuario = ?, rol = ?`;
        let params = [nombre, usuario, rol || 'vendedor'];

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            updateQuery += `, password = ?`;
            params.push(passwordHash);
        }

        updateQuery += ` WHERE id_usuario = ?`;
        params.push(id);

        await db.query(updateQuery, params);

        res.json({
            success: true,
            mensaje: "Usuario actualizado exitosamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al actualizar el usuario",
            error: error.message
        });
    }
};

// ===========================
//      ELIMINAR USUARIO
// ===========================
const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const [usuarioExistente] = await db.query(
            `SELECT id_usuario FROM usuario WHERE id_usuario = ?`,
            [id]
        );

        if (usuarioExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        // Verificar si el usuario tiene ventas asociadas
        const [ventas] = await db.query(
            `SELECT COUNT(*) as total FROM venta WHERE id_usuario = ?`,
            [id]
        );

        if (ventas[0].total > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "No se puede eliminar el usuario porque tiene ventas asociadas"
            });
        }

        await db.query(
            `DELETE FROM usuario WHERE id_usuario = ?`,
            [id]
        );

        res.json({
            success: true,
            mensaje: "Usuario eliminado correctamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar el usuario",
            error: error.message
        });
    }
};

// ===========================
//   LOGIN DE USUARIO
// ===========================
const loginUsuario = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({
                success: false,
                mensaje: "Usuario y contraseña son obligatorios"
            });
        }

        const [usuarios] = await db.query(
            `SELECT id_usuario, nombre, usuario, password, rol
             FROM usuario 
             WHERE usuario = ?`,
            [usuario]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                success: false,
                mensaje: "Credenciales incorrectas"
            });
        }

        const usuarioData = usuarios[0];

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuarioData.password);

        if (!passwordValido) {
            return res.status(401).json({
                success: false,
                mensaje: "Credenciales incorrectas"
            });
        }

        // No enviar la contraseña en la respuesta
        delete usuarioData.password;

        res.json({
            success: true,
            mensaje: "Login exitoso",
            data: usuarioData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error en el login",
            error: error.message
        });
    }
};

// ===========================
//   CAMBIAR CONTRASEÑA
// ===========================
const cambiarPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { passwordActual, passwordNueva } = req.body;

        if (!passwordActual || !passwordNueva) {
            return res.status(400).json({
                success: false,
                mensaje: "Contraseña actual y nueva son obligatorias"
            });
        }

        const [usuarios] = await db.query(
            `SELECT password FROM usuario WHERE id_usuario = ?`,
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        // Verificar contraseña actual
        const passwordValido = await bcrypt.compare(passwordActual, usuarios[0].password);

        if (!passwordValido) {
            return res.status(401).json({
                success: false,
                mensaje: "Contraseña actual incorrecta"
            });
        }

        // Encriptar nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordNueva, salt);

        await db.query(
            `UPDATE usuario SET password = ? WHERE id_usuario = ?`,
            [passwordHash, id]
        );

        res.json({
            success: true,
            mensaje: "Contraseña actualizada exitosamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al cambiar la contraseña",
            error: error.message
        });
    }
};

// ===========================
//   BUSCAR USUARIO POR NOMBRE DE USUARIO
// ===========================
const buscarUsuarioPorNombre = async (req, res) => {
    try {
        const { usuario } = req.params;

        const [usuarios] = await db.query(
            `SELECT id_usuario, nombre, usuario, rol
             FROM usuario 
             WHERE usuario LIKE ?`,
            [`%${usuario}%`]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "No se encontraron usuarios"
            });
        }

        res.json({
            success: true,
            count: usuarios.length,
            data: usuarios
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al buscar usuarios",
            error: error.message
        });
    }
};

// ===========================
//   OBTENER USUARIOS POR ROL
// ===========================
const obtenerUsuariosPorRol = async (req, res) => {
    try {
        const { rol } = req.params;

        const [usuarios] = await db.query(
            `SELECT id_usuario, nombre, usuario, rol
             FROM usuario 
             WHERE rol = ?
             ORDER BY id_usuario DESC`,
            [rol]
        );

        res.json({
            success: true,
            count: usuarios.length,
            data: usuarios
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener usuarios por rol",
            error: error.message
        });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    loginUsuario,
    cambiarPassword,
    buscarUsuarioPorNombre,
    obtenerUsuariosPorRol
};