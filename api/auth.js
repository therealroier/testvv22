let usersDB = []; 

const FINAL_SCRIPT = "https://pastefy.app/a5g4vwd3/raw";

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer DZisthegoat') {
        return res.status(403).json({ message: "Forbidden" });
    }

    const { action, nickname, password, license } = req.body;

    if (action === "register") {
        const lowerNick = nickname.toLowerCase();
        const exists = usersDB.find(u => u.nickname.toLowerCase() === lowerNick);
        if (exists) {
            return res.status(400).json({ status: "error", message: "Exists" });
        }
        usersDB.push({ nickname, password, license });
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const lowerNick = nickname.toLowerCase();
        const user = usersDB.find(u => u.nickname.toLowerCase() === lowerNick && u.password === password);
        
        if (!user) {
            return res.status(401).json({ status: "error", message: "Not Found" });
        }

        return res.status(200).json({ 
            status: "success", 
            license: user.license,
            script: FINAL_SCRIPT
        });
    }

    if (action === "delete") {
        const lowerNick = nickname.toLowerCase();
        usersDB = usersDB.filter(u => u.nickname.toLowerCase() !== lowerNick);
        return res.status(200).json({ status: "success", message: "User Removed" });
    }

    res.status(404).send('');
};
