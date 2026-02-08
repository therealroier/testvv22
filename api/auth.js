let usersDB = []; 

const SCRIPTS_BY_GAME = {
    "135856908115931": "https://raw.githubusercontent.com/therealroier/ScriptDz/heads/main/DUELS",
    "74084441161738": "https://raw.githubusercontent.com/therealroier/ScriptDz/heads/main/DUELS",
    "131117978948830": "https://raw.githubusercontent.com/therealroier/ScriptDz/heads/main/DUELS"
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer DZisthegoat') {
        return res.status(403).json({ message: "Forbidden" });
    }

    const { action, nickname, password, license, hwid, placeId, keyExpired } = req.body;

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

        if (keyExpired) {
            usersDB = usersDB.filter(u => u.nickname !== nickname);
            return res.status(410).json({ message: "Expired" });
        }

        const scriptUrl = SCRIPTS_BY_GAME[String(placeId)];
        if (!scriptUrl) return res.status(404).json({ message: "Game not supported" });

        return res.status(200).json({ 
            status: "success", 
            license: user.license, 
            scriptUrl: scriptUrl 
        });
    }

    res.status(404).send('');
};
