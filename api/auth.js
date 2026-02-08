let usersDB = [];
let executionLogs = [];
let onlineStatus = {};
const FINAL_SCRIPT = "https://pastefy.app/a5g4vwd3/raw";

const today = () => new Date().toISOString().slice(0, 10);

async function validateJunkie(license) {
    try {
        const response = await fetch(`https://jnkie.com/api/v1/keys/view?key=${license}`, {
            headers: { "Authorization": "1009035" }
        });
        const data = await response.json();
        return data && data.status === "active"; 
    } catch (e) {
        return false;
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action, nickname, password, license } = req.body;
    const now = Date.now();
    const t = today();

    // ACCIÓN PARA REINICIAR TODO SI SE TRABA (Escribir esto en consola o Postman)
    if (action === "force_reset") {
        usersDB = [];
        executionLogs = [];
        onlineStatus = {};
        return res.status(200).json({ status: "success", message: "Database Cleared" });
    }

    if (action === "fetch_all") {
        const onlineUsers = Object.keys(onlineStatus).filter(name => now - onlineStatus[name] < 40000).length;
        return res.status(200).json({
            total: executionLogs.length,
            usersCount: usersDB.length,
            newToday: usersDB.filter(u => u.regDate === t).length,
            online: onlineUsers,
            logs: executionLogs.slice(0, 50),
            users: usersDB
        });
    }

    if (action === "register") {
        const cleanNick = nickname.trim().toLowerCase();
        
        // 1. Validar la Key primero (Si la key no sirve, no hacemos nada)
        const isNewKeyValid = await validateJunkie(license);
        if (!isNewKeyValid) {
            return res.status(403).json({ status: "error", message: "InvalidKey" });
        }

        // 2. Limpieza agresiva de nombres duplicados
        const existingIndex = usersDB.findIndex(u => u.username.toLowerCase() === cleanNick);
        if (existingIndex !== -1) {
            const oldUser = usersDB[existingIndex];
            const isOldKeyActive = await validateJunkie(oldUser.license);
            
            // Si la key vieja ya no es activa, borramos al usuario viejo automáticamente
            if (!isOldKeyActive) {
                usersDB.splice(existingIndex, 1);
            } else {
                // Si la key vieja SIGUE activa, entonces el nombre realmente está ocupado
                return res.status(400).json({ status: "error", message: "UserExists" });
            }
        }

        // 3. Verificar si la Key ya está vinculada a OTRA cuenta
        if (usersDB.some(u => u.license === license)) {
            return res.status(403).json({ status: "error", message: "KeyUsed" });
        }

        // 4. Registrar nuevo usuario
        usersDB.push({
            username: nickname.trim(),
            password: password,
            license: license,
            regDate: t
        });

        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const cleanNick = nickname.trim().toLowerCase();
        const userIndex = usersDB.findIndex(u => u.username.toLowerCase() === cleanNick && u.password === password);

        if (userIndex === -1) {
            return res.status(401).json({ status: "error", message: "Invalid" });
        }

        const user = usersDB[userIndex];
        const isKeyStillActive = await validateJunkie(user.license);

        if (!isKeyStillActive) {
            usersDB.splice(userIndex, 1); // Borrar si la key caducó
            return res.status(403).json({ status: "error", message: "KeyExpired_UserPurged" });
        }

        onlineStatus[user.username] = now;
        executionLogs.unshift({
            username: user.username,
            time: new Date().toLocaleTimeString(),
            date: t
        });

        return res.status(200).json({ status: "success", script: FINAL_SCRIPT });
    }

    res.status(404).json({ error: "ActionNotFound" });
};
