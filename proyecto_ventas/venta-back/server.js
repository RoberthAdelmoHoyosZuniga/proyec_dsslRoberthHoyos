require('dotenv').config();
const express = require('express');
const cors = require('cors');

const clienteRoutes = require('./routes/clientesroutes');
const categoriaRoutes = require('./routes/categoriaroutes');
const productoRoutes = require('./routes/productosroutes');
const usuarioRoutes = require('./routes/usuariosroutes');
const metodoPagoRoutes = require('./routes/metodopagoroutes');
const ventaRoutes = require('./routes/ventasroutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/clientes', clienteRoutes);      // ✅ Cambiado a clienteRoutes
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/metodos-pago', metodoPagoRoutes);
app.use('/api/ventas', ventaRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: "API SISTEMA DE VENTAS - CRUD",
        version: "1.0.0",
        endpoints: {
            clientes: "/api/clientes",
            categorias: "/api/categorias",
            productos: "/api/productos",
            usuarios: "/api/usuarios",
            metodosPago: "/api/metodos-pago",
            ventas: "/api/ventas"
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor inicializado en http://localhost:${PORT}`);
});