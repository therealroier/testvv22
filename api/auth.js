let users = []; 

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== 'Bearer DZisthegoat') {
        return res.status(401).json({ status: "error", message: "Unauthorized API Key" });
    }

    if (req.method === 'POST') {
        const { action, username, password, key } = req.body;

        if (action === 'register') {
            const exists = users.find(u => u.username === username);
            if (exists) return res.status(400).json({ status: "error", message: "User already exists" });

            users.push({ username, password, key, date: new Date().toISOString() });
            console.log(`Usuario registrado: ${username}`);
            return res.status(200).json({ status: "success", message: "User registered" });
        }

        if (action === 'login') {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                console.log(`Login exitoso: ${username}`);
                return res.status(200).json({ status: "success", message: "Login successful" });
            }
            return res.status(403).json({ status: "error", message: "Invalid credentials" });
        }
    }

    if (req.method === 'GET') {
        return res.status(200).json(users);
    }

    res.status(405).json({ message: "Method Not Allowed" });
};
