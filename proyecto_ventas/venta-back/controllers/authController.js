const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * Registrar nuevo usuario
 * POST /api/auth/registro
 */
const registrarUsuario = async (req, res) => {
    try {
        // Validar errores
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errores: errors.array()
            });
        }

        const { nombre, usuario, password, rol } = req.body;

        // Verificar si el usuario ya existe
        const [usuarioExistente] = await db.query(
            'SELECT * FROM usuario WHERE usuario = ?',
            [usuario]
        );

        if (usuarioExistente.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: 'El usuario ya está registrado'
            });
        }

        // Hashear password
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar usuario
        const [resultado] = await db.query(
            'INSERT INTO usuario (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, usuario, passwordHash, rol || 'usuario']
        );

        res.status(201).json({
            success: true,
            mensaje: 'Usuario registrado exitosamente',
            data: {
                id: resultado.insertId,
                nombre,
                usuario,
                rol: rol || 'usuario'
            }
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al registrar usuario',
            error: error.message
        });
    }
};

/**
 * Iniciar sesión
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        // Validar campos
        if (!usuario || !password) {
            return res.status(400).json({
                success: false,
                mensaje: "Usuario y contraseña son obligatorios"
            });
        }

        // Buscar el usuario en la base de datos
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

        // Verificar la contraseña
        const passwordValido = await bcrypt.compare(password, usuarioData.password);

        if (!passwordValido) {
            return res.status(401).json({
                success: false,
                mensaje: "Credenciales incorrectas"
            });
        }

        // Generar el Token JWT
        const token = jwt.sign(
            {
                id: usuarioData.id_usuario,
                usuario: usuarioData.usuario,
                nombre: usuarioData.nombre,
                rol: usuarioData.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // No enviar la contraseña en la respuesta
        delete usuarioData.password;

        res.json({
            success: true,
            mensaje: "Login exitoso",
            token: token,
            usuario: usuarioData
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            mensaje: "Error en el servidor durante el login",
            error: error.message
        });
    }
};

/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/perfil
 */
const obtenerPerfil = async (req, res) => {
    try {
        const [usuarios] = await db.query(
            'SELECT id_usuario, nombre, usuario, rol FROM usuario WHERE id_usuario = ?',
            [req.usuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: usuarios[0]
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener perfil',
            error: error.message
        });
    }
};

/**
 * Verificar token (renovación)
 * GET /api/auth/verificar
 */
const verificarToken = (req, res) => {
    res.json({
        success: true,
        mensaje: 'Token válido',
        usuario: req.usuario
    });
};

module.exports = {
    registrarUsuario,
    login,
    obtenerPerfil,
    verificarToken
};