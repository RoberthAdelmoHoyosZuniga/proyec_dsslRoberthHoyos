
const http = require('http');

function get(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function debug() {
    try {
        console.log("Fetching Metodos de Pago...");
        const metodos = await get('/api/metodos-pago');
        console.log("Result:", JSON.stringify(metodos, null, 2));

        console.log("\nFetching Categorias...");
        const categorias = await get('/api/categorias');
        console.log("Result:", JSON.stringify(categorias, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}

debug();
