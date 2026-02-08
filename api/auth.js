module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== 'Bearer DZisthegoat') {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    if (req.method === 'POST') {
        const { Username, Key, Licencia } = req.body;
        
        console.log("--- EJECUCIÓN DETECTADA ---");
        console.log("Usuario:", Username);
        console.log("Licencia:", Licencia);
        console.log("Key:", Key);
        
        res.status(200).json({
            status: "success",
            message: "Exec enviado ✅"
        });
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
};
