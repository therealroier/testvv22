let usersDB = []; 

const FINAL_SCRIPT = "https://pastefy.app/a5g4vwd3/raw";

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer DZisthegoat') {
        return res.status(403).json({ message: "error" });
    }

    const { action, nickname, password, license, statusFromJunkie } = req.body;

    if (action === "ping") {
        return res.status(200).json({ 
            status: "alive", 
            total_users: usersDB.length 
        });
    }

    // ESTO ES LO QUE LEE TU DASHBOARD
    if (action === "fetch_all") {
        return res.status(200).json({
            users: usersDB,
            config: {
                total: usersDB.length,
                lastUpdate: new Date().toISOString()
            }
        });
    }

    if (action === "register") {
        const lowerNick = nickname.toLowerCase();
        if (usersDB.find(u => u.nickname.toLowerCase() === lowerNick)) {
            return res.status(400).json({ status: "error", message: "UserExists" });
        }
        if (usersDB.find(u => u.license === license)) {
            return res.status(400).json({ status: "error", message: "LicenseUsed" });
        }
        
        usersDB.push({ 
            id: Math.random().toString(36).substr(2, 9),
            username: nickname, // Lo guardamos como username para que el Dashboard lo lea bien
            password: password, 
            key: license, 
            timestamp: new Date().toISOString(),
            isActive: true 
        });
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const lowerNick = nickname.toLowerCase();
        const user = usersDB.find(u => u.username.toLowerCase() === lowerNick && u.password === password);
        
        if (!user) return res.status(401).json({ status: "error" });

        return res.status(200).json({ 
            status: "success", 
            license: user.key,
            script: FINAL_SCRIPT
        });
    }

    if (action === "delete") {
        if (statusFromJunkie === "expired") {
            const lowerNick = nickname.toLowerCase();
            usersDB = usersDB.filter(u => u.username.toLowerCase() !== lowerNick);
            return res.status(200).json({ status: "success", message: "User cleaned because key expired" });
        }
        return res.status(400).json({ status: "error", message: "Delete refused: Key still valid" });
    }

    res.status(404).send('');
};
