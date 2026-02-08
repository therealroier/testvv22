// Base de datos temporal (Se reinicia si Vercel duerme la función)
// Para algo permanente, usa una DB como MongoDB o Supabase.
let usersDB = []; 

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action, username, password, junkieKey, licencia } = req.body;

    // --- ACCIÓN: REGISTRO ---
    if (action === "register") {
        const exists = usersDB.find(u => u.username === username);
        if (exists) return res.status(400).json({ message: "Usuario ya existe" });

        usersDB.push({
            username,
            password,
            junkieKey,
            licencia
        });

        console.log(`[REGISTRO] Usuario: ${username} guardado.`);
        return res.status(200).json({ status: "success" });
    }

    // --- ACCIÓN: LOGIN ---
    if (action === "login") {
        const userIndex = usersDB.findIndex(u => u.username === username && u.password === password);
        
        if (userIndex === -1) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const userData = usersDB[userIndex];

        // Aquí el script de Roblox debe decirnos si la key es válida
        // Pero si la API recibe una señal de que la key expiró:
        if (req.body.keyExpired) {
            console.log(`[BORRADO] Usuario ${username} eliminado por Key caducada.`);
            usersDB.splice(userIndex, 1);
            return res.status(410).json({ message: "Key caducada, usuario borrado" });
        }

        return res.status(200).json({ status: "success", junkieKey: userData.junkieKey });
    }

    res.status(404).send('');
};
