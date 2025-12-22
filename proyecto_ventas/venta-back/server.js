require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clientesroutes');
const categoriaRoutes = require('./routes/categoriaroutes');
const productoRoutes = require('./routes/productosroutes');
const usuarioRoutes = require('./routes/usuariosroutes');
const metodoPagoRoutes = require('./routes/metodopagoroutes');
const ventaRoutes = require('./routes/ventasroutes');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/metodos-pago', metodoPagoRoutes);
app.use('/api/ventas', ventaRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        mensaje: "API SISTEMA DE VENTAS - CRUD con Autenticación JWT",
        version: "2.0.0",
        endpoints: {
            autenticacion: {
                registro: "POST /api/auth/registro",
                login: "POST /api/auth/login",
                perfil: "GET /api/auth/perfil [Token requerido]",
                verificar: "GET /api/auth/verificar [Token requerido]"
            },
            clientes: {
                obtenerTodos: "GET /api/clientes",
                obtenerPorId: "GET /api/clientes/:id",
                crear: "POST /api/clientes [Token requerido]",
                actualizar: "PUT /api/clientes/:id [Token requerido]",
                eliminar: "DELETE /api/clientes/:id [Token requerido]"
            },
            categorias: {
                obtenerTodos: "GET /api/categorias",
                crear: "POST /api/categorias [Token requerido]"
            },
            productos: {
                obtenerTodos: "GET /api/productos",
                obtenerPorId: "GET /api/productos/:id",
                crear: "POST /api/productos [Token requerido]",
                actualizar: "PUT /api/productos/:id [Token requerido]",
                eliminar: "DELETE /api/productos/:id [Token requerido]"
            },
            usuarios: {
                obtenerTodos: "GET /api/usuarios [Admin requerido]",
                crear: "POST /api/usuarios [Admin requerido]",
                actualizar: "PUT /api/usuarios/:id [Admin requerido]",
                eliminar: "DELETE /api/usuarios/:id [Admin requerido]"
            },
            metodosPago: {
                obtenerTodos: "GET /api/metodos-pago",
                crear: "POST /api/metodos-pago [Token requerido]"
            },
            ventas: {
                obtenerTodos: "GET /api/ventas [Token requerido]",
                obtenerPorId: "GET /api/ventas/:id [Token requerido]",
                crear: "POST /api/ventas [Token requerido]"
            }
        },
        autenticacion: {
            tipo: "Bearer Token (JWT)",
            header: "Authorization: Bearer <token>",
            expiracion: "24 horas"
        }
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        mensaje: "Ruta no encontrada"
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log('Servidor con JWT inicializado correctamente');
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Base de datos: ${process.env.DB_NAME || 'bdventas'}`);
    console.log(`JWT configurado - Expiración: ${process.env.JWT_EXPIRES_IN || '24h'}`);
    console.log('═══════════════════════════════════════════');
});