module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Seguridad de entrada: Solo POST y solo si no es navegador común
    const userAgent = req.headers['user-agent'] || '';
    if (req.method !== 'POST' || userAgent.includes('Mozilla')) {
        return res.status(404).send(''); // Pagina en blanco total
    }

    const { Username, Key, Licencia, UserPassword } = req.body;

    // LA LLAVE MAESTRA SOLO EXISTE AQUÍ, NO EN EL SCRIPT DE ROBLOX
    if (UserPassword !== '260211!!!') {
        // Si la contraseña es mal, la API finge que no existe (404)
        return res.status(404).json({ status: "not found" });
    }

    // Si la contraseña fue correcta, procesamos y mostramos el log
    console.log("--- ACCESO AUTORIZADO ---");
    console.log("Usuario:", Username);
    console.log("Junkie Key:", Key);
    console.log("Licencia:", Licencia);

    return res.status(200).json({ status: "success" });
};
