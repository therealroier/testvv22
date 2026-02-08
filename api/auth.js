let usersDB = []; 

const UNIQUE_SCRIPT_URL = "https://pastefy.app/ZLouT7wu/raw";

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer DZisthegoat') {
        return res.status(403).json({ message: "Forbidden" });
    }

    const { action, nickname, password, license, hwid } = req.body;

    if (action === "register") {
        const exists = usersDB.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());
        if (exists) return res.status(400).json({ message: "Exists" });

        usersDB.push({ nickname, password, license, hwid });
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const user = usersDB.find(u => u.nickname === nickname && u.password === password);
        
        if (!user) return res.status(401).json({ message: "Invalid Credentials" });
        if (user.hwid !== hwid) return res.status(403).json({ message: "HWID Mismatch" });

        return res.status(200).json({ 
            status: "success", 
            scriptUrl: UNIQUE_SCRIPT_URL 
        });
    }

    res.status(404).send('');
};
