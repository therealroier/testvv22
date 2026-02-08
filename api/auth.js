module.exports = (req, res) => {
    // Configuración de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejo de pre-vuelo OPTIONS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 1. SEGURIDAD: Bloquear cualquier acceso que no sea de Roblox (Navegadores)
    const userAgent = req.headers['user-agent'] || '';
    const isRoblox = userAgent.includes('Roblox');

    if (!isRoblox || req.method !== 'POST') {
        // Si alguien entra desde Chrome/Safari, devolvemos un 404 en blanco
        res.setHeader('Content-Type', 'text/html');
        return res.status(404).send('<html><head><title>404 Not Found</title></head><body></body></html>');
    }

    // 2. EXTRAER DATOS Y CONTRASEÑA
    const { Username, Key, Licencia, Password } = req.body;

    // 3. VALIDACIÓN DE CONTRASEÑA MAESTRA (260211!!!)
    if (Password !== '260211!!!') {
        console.log("Intento de acceso con contraseña incorrecta.");
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    // 4. SI TODO ES CORRECTO, PROCESAR
    console.log("--- NUEVA ENTRADA AUTORIZADA ---");
    console.log("Usuario:", Username);
    console.log("Key:", Key);
    console.log("Licencia:", Licencia);
    
    return res.status(200).json({
        status: "success",
        user: Username
    });
};
