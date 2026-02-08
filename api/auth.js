module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // BLOQUEO DE NAVEGADORES: Si entran por URL normal, pantalla en blanco (404)
    const userAgent = req.headers['user-agent'] || '';
    if (req.method !== 'POST' || userAgent.includes('Mozilla')) {
        return res.status(404).send(''); 
    }

    const { Username, Password, JunkieKey, Licencia } = req.body;

    // VALIDACIÓN DE SEGURIDAD INTERNA
    // Aquí puedes poner una lógica para que solo acepte registros si vienen con un Header secreto
    // o simplemente procesar lo que llega desde el ejecutor.
    
    console.log("--- NUEVO REGISTRO DE USUARIO ---");
    console.log("Usuario Elegido:", Username);
    console.log("Password Elegida:", Password);
    console.log("Key Usada:", JunkieKey);
    console.log("Licencia:", Licencia);

    res.status(200).json({
        status: "success",
        message: "Usuario registrado en los logs"
    });
};
