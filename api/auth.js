let usersDB = []; 

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const userAgent = req.headers['user-agent'] || '';
    if (req.method !== 'POST' || userAgent.includes('Mozilla')) {
        return res.status(404).send(''); 
    }

    const { action, nickname, password, license, keyExpired } = req.body;

    if (action === "register") {
        const exists = usersDB.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());
        if (exists) {
            return res.status(400).json({ status: "error", message: "User already exists" });
        }

        usersDB.push({
            nickname,
            password,
            license
        });

        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const userIndex = usersDB.findIndex(u => u.nickname === nickname && u.password === password);
        
        if (userIndex === -1) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (keyExpired) {
            usersDB.splice(userIndex, 1);
            return res.status(410).json({ message: "License expired" });
        }

        return res.status(200).json({ 
            status: "success", 
            license: usersDB[userIndex].license 
        });
    }

    res.status(404).send('');
};
