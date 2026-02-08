let usersDB = []; 

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer DZisthegoat') {
        return res.status(403).json({ message: "Forbidden" });
    }

    const { action, nickname, password, license, keyExpired } = req.body;

    if (action === "ping") {
        return res.status(200).json({ status: "alive" });
    }

    if (action === "register") {
        const exists = usersDB.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());
        if (exists) {
            return res.status(400).json({ status: "error", message: "Exists" });
        }
        usersDB.push({ nickname, password, license });
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const userIndex = usersDB.findIndex(u => u.nickname.toLowerCase() === nickname.toLowerCase() && u.password === password);
        
        if (userIndex === -1) {
            return res.status(401).json({ status: "error", message: "Not Found" });
        }

        if (keyExpired === true) {
            usersDB.splice(userIndex, 1);
            return res.status(200).json({ status: "deleted" });
        }

        return res.status(200).json({ 
            status: "success", 
            license: usersDB[userIndex].license 
        });
    }
    res.status(404).send('');
};
