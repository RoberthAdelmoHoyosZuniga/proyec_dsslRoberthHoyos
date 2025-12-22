const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function hashPasswords() {
    try {
        console.log('Iniciando migración de contraseñas...');

        // Obtener todos los usuarios
        const [usuarios] = await db.query('SELECT id_usuario, usuario, password FROM usuario');

        for (const user of usuarios) {
            // Verificar si ya parece un hash de bcrypt (empieza por $2a$ o $2b$)
            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                console.log(`Usuario "${user.usuario}" ya tiene contraseña hasheada. Saltando...`);
                continue;
            }

            console.log(`Hasheando contraseña para el usuario: ${user.usuario}`);
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(user.password, salt);

            await db.query('UPDATE usuario SET password = ? WHERE id_usuario = ?', [hashed, user.id_usuario]);
            console.log(`✅ Contraseña actualizada para: ${user.usuario}`);
        }

        console.log('Migración completada con éxito.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error durante la migración:', err);
        process.exit(1);
    }
}

hashPasswords();
