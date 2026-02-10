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

    const { action, nickname, password, license } = req.body;

    if (action === "ping") {
        return res.status(200).json({ 
            status: "alive", 
            total_users: usersDB.length 
        });
    }

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
        if (usersDB.find(u => u.username && u.username.toLowerCase() === lowerNick)) {
            return res.status(400).json({ status: "error", message: "UserExists" });
        }
        if (usersDB.find(u => u.key === license)) {
            return res.status(400).json({ status: "error", message: "LicenseUsed" });
        }
        
        usersDB.push({ 
            id: Math.random().toString(36).substr(2, 9),
            username: nickname, 
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

    if (action === "heartbeat") {
        const lowerNick = nickname.toLowerCase();
        const user = usersDB.find(u => u.username.toLowerCase() === lowerNick);
        if (user) {
            user.lastSeen = new Date().toISOString();
            return res.status(200).json({ status: "kept-alive" });
        }
        return res.status(404).json({ status: "not-found" });
    }

    if (action === "delete") {
        const lowerNick = nickname.toLowerCase();
        usersDB = usersDB.filter(u => u.username.toLowerCase() !== lowerNick);
        return res.status(200).json({ status: "success", message: "User cleaned" });
    }

    res.status(404).send('');
};
