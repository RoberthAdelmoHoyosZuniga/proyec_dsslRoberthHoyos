const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT
 * Protege rutas que requieren autenticación
 */
const verificarToken = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                mensaje: "Acceso denegado. Token no proporcionado"
            });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Agregar la información del usuario al request
        req.usuario = decoded;

        // Continuar con la siguiente función
        next();
    } catch (error) {
        // Token inválido o expirado
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                mensaje: "Token inválido"
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                mensaje: "Token expirado"
            });
        }

        return res.status(500).json({
            success: false,
            mensaje: "Error al verificar token",
            error: error.message
        });
    }
};

/**
 * Middleware para verificar rol de administrador
 * Debe usarse después de verificarToken
 */
const verificarAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            mensaje: "Acceso denegado. Se requieren permisos de administrador"
        });
    }
    next();
};

/**
 * Middleware para verificar roles específicos
 * Uso: verificarRoles(['admin', 'vendedor'])
 */
const verificarRoles = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                success: false,
                mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
            });
        }
        next();
    };
};

module.exports = {
    verificarToken,
    verificarAdmin,
    verificarRoles
};