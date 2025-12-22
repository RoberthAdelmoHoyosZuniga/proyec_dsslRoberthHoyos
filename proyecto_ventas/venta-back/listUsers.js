const db = require('./config/database');

async function listUsers() {
    try {
        const [rows] = await db.query('SELECT * FROM usuario');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error querying users:', err);
        process.exit(1);
    }
}

listUsers();
