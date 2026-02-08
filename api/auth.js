module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // BLOQUEO DE NAVEGADORES: Si no es una petición POST de un ejecutor, mostramos 404
    const userAgent = req.headers['user-agent'] || '';
    if (!userAgent.includes('Roblox') && req.method !== 'POST') {
        res.setHeader('Content-Type', 'text/html');
        return res.status(404).send('<html><head><title>404 Not Found</title></head><body></body></html>');
    }

    if (req.method === 'POST') {
        const { Username, Key, Licencia, UserPassword } = req.body;
        const authHeader = req.headers['authorization'];

        // VALIDACIÓN 1: API KEY (DZisthegoat)
        if (!authHeader || authHeader !== 'Bearer DZisthegoat') {
            return res.status(401).json({ status: "error", message: "Invalid API Key" });
        }

        // VALIDACIÓN 2: PASSWORD DEL USUARIO (260211!!!)
        if (UserPassword !== '260211!!!') {
            return res.status(403).json({ status: "error", message: "Wrong Master Password" });
        }

        console.log("--- NUEVA ENTRADA AUTORIZADA ---");
        console.log("Usuario:", Username);
        console.log("Key:", Key);
        console.log("Licencia:", Licencia);

        res.status(200).json({ status: "success", user: Username });
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
};
