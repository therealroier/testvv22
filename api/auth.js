module.exports = (req, res) => {
    // Configuración de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // --- PROTECCIÓN CON CONTRASEÑA PARA EL NAVEGADOR ---
    const auth = req.headers.authorization;
    
    // Credenciales: Usuario: admin | Pass: 260211!!!
    // El string en base64 de "admin:260211!!!" es "YWRtaW46MjYwMjExISEh"
    if (!auth || auth !== 'Basic YWRtaW46MjYwMjExISEh') {
        res.setHeader('WWW-Authenticate', 'Basic realm="Acceso Protegido"');
        return res.status(401).send('Acceso denegado. Se requiere contraseña.');
    }

    // --- SI LA CONTRASEÑA ES CORRECTA, MOSTRAR CONTENIDO ---
    if (req.method === 'POST') {
        const { Username, Key, Licencia, Password } = req.body;

        // Validación extra de la contraseña que viene del TextBox de Roblox
        if (Password !== '260211!!!') {
            return res.status(403).json({ status: "error", message: "Password de usuario incorrecta" });
        }

        console.log("--- NUEVA ENTRADA ---");
        console.log("Usuario:", Username);
        console.log("Key:", Key);
        console.log("Licencia:", Licencia);

        return res.status(200).json({ status: "success", user: Username });
    } else {
        // Esto es lo que verás en el navegador después de poner la contraseña
        res.status(200).send('<h1>Logs de la API activos</h1><p>Esperando peticiones POST desde Roblox...</p>');
    }
};
