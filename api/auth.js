module.exports = (req, res) => {
    // 1. Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const userAgent = req.headers['user-agent'] || '';
    const isBrowser = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari');
    
    if (isBrowser && req.method !== 'POST') {
        return res.status(404).send('')
    }

    if (req.method === 'POST') {
        const { Username, Key, Licencia } = req.body;
        const authHeader = req.headers['authorization'];

        if (!authHeader || authHeader !== '260211!!!') {
            console.log("Intento de acceso no autorizado bloqueado.");
            return res.status(401).json({ status: "error", message: "Unauthorized access" });
        }
        
        console.log("--- NUEVA ENTRADA AUTORIZADA ---");
        console.log("Usuario:", Username);
        console.log("Key:", Key);
        console.log("Licencia:", Licencia);
        console.log("User-Agent:", userAgent);
        
        return res.status(200).json({
            status: "success",
            message: "Data received",
            user: Username
        });
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
};
