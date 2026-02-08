let usersDB = [];
let licensesDB = [
    { id: '1', key: 'ILLUXION-ADMIN-99', owner: 'System', isActive: true, type: 'Developer', expiryDate: '2027-01-01' }
];
let executionLogs = [];

const FINAL_SCRIPT = "https://pastefy.app/a5g4vwd3/raw";

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer DZisthegoat') {
        return res.status(403).json({ message: "Forbidden" });
    }

    const { action, nickname, password, license } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || '0.0.0.0';

    if (action === "fetch_all") {
        return res.status(200).json({ users: usersDB, licenses: licensesDB, logs: executionLogs });
    }

    if (action === "register") {
        const cleanNick = nickname.trim().toLowerCase();
        
        // CORRECCIÓN: Verificar si el nombre ya existe de forma segura
        const userExists = usersDB.some(u => u.username.toLowerCase() === cleanNick);
        if (userExists) {
            return res.status(400).json({ status: "error", message: "UserExists" });
        }

        // Verificar si la licencia ya está en uso por otra persona
        const licenseUsed = usersDB.some(u => u.key === license);
        if (licenseUsed) {
            return res.status(400).json({ status: "error", message: "LicenseUsed" });
        }

        const newUser = { 
            id: Math.random().toString(36).substr(2, 9),
            username: nickname.trim(), 
            password: password, 
            key: license, 
            timestamp: new Date().toISOString(),
            isActive: true 
        };

        usersDB.push(newUser);
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const cleanNick = nickname.trim().toLowerCase();
        const user = usersDB.find(u => u.username.toLowerCase() === cleanNick && u.password === password);
        
        if (!user) return res.status(401).json({ status: "error", message: "Invalid" });

        executionLogs.unshift({
            id: Math.random().toString(36).substr(2, 5),
            username: user.username,
            timestamp: new Date().toISOString(),
            status: 'Authorized',
            ip: clientIp
        });

        return res.status(200).json({ status: "success", license: user.key, script: FINAL_SCRIPT });
    }

    if (action === "delete") {
        usersDB = usersDB.filter(u => u.username.toLowerCase() !== nickname.toLowerCase());
        return res.status(200).json({ status: "success" });
    }

    res.status(404).json({ error: "ActionNotFound" });
};
