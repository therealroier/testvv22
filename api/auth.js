let usersDB = [];
let licensesDB = [
    { id: '1', key: 'ILLUXION-ADMIN-99', owner: 'System', isActive: true, type: 'Developer', expiryDate: '2027-01-01' }
];
let executionLogs = [];

const FINAL_SCRIPT = "https://pastefy.app/a5g4vwd3/raw";

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer DZisthegoat') {
        return res.status(403).json({ message: "Forbidden: Core Security Violation" });
    }

    const { action, nickname, password, license, id, type, owner } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';

    // --- SISTEMA DE TELEMETRÍA Y LIVE SESSIONS ---
    if (action === "fetch_all") {
        return res.status(200).json({
            users: usersDB,
            licenses: licensesDB,
            logs: executionLogs,
            config: {
                total_users: usersDB.length,
                active_licenses: licensesDB.filter(l => l.isActive).length,
                lastUpdate: new Date().toISOString()
            }
        });
    }

    // --- ACCIONES DE ROBLOX (AUTH & LOGIN) ---
    if (action === "login") {
        const lowerNick = nickname.toLowerCase();
        const user = usersDB.find(u => u.username.toLowerCase() === lowerNick && u.password === password);
        
        if (!user) {
            executionLogs.unshift({ id: Math.random().toString(36).substr(2, 5), username: nickname, timestamp: new Date().toISOString(), status: 'Unauthorized', ip: clientIp });
            return res.status(401).json({ status: "error", message: "InvalidCredentials" });
        }

        // Verificar si la licencia asociada al usuario sigue activa
        const userLicense = licensesDB.find(l => l.key === user.key);
        if (!userLicense || !userLicense.isActive) {
            executionLogs.unshift({ id: Math.random().toString(36).substr(2, 5), username: nickname, timestamp: new Date().toISOString(), status: 'Unauthorized', ip: clientIp });
            return res.status(403).json({ status: "error", message: "LicenseSuspended" });
        }

        // Registro de ejecución exitosa (Live Session)
        executionLogs.unshift({
            id: Math.random().toString(36).substr(2, 9),
            username: nickname,
            timestamp: new Date().toISOString(),
            status: 'Authorized',
            ip: clientIp
        });

        return res.status(200).json({ 
            status: "success", 
            license: user.key,
            script: FINAL_SCRIPT 
        });
    }

    if (action === "register") {
        const lowerNick = nickname.toLowerCase();
        const licenseCheck = licensesDB.find(l => l.key === license && l.isActive);

        if (!licenseCheck) return res.status(400).json({ status: "error", message: "InvalidLicense" });
        if (usersDB.find(u => u.username.toLowerCase() === lowerNick)) return res.status(400).json({ status: "error", message: "UserExists" });
        if (usersDB.find(u => u.key === license)) return res.status(400).json({ status: "error", message: "LicenseAlreadyLinked" });

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

    // --- GESTIÓN DE LICENCIAS (DESDE DASHBOARD) ---
    if (action === "create_license") {
        const newLic = {
            id: Math.random().toString(36).substr(2, 9),
            key: license || `ILLUX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            owner: owner || "Unknown",
            type: type || "Standard",
            expiryDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
            isActive: true
        };
        licensesDB.push(newLic);
        return res.status(200).json(newLic);
    }

    if (action === "toggle_license") {
        licensesDB = licensesDB.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l);
        return res.status(200).json({ status: "success" });
    }

    if (action === "delete_license") {
        licensesDB = licensesDB.filter(l => l.id !== id);
        return res.status(200).json({ status: "success" });
    }

    // --- LIMPIEZA DE DATOS ---
    if (action === "delete_user") {
        usersDB = usersDB.filter(u => u.id !== id);
        return res.status(200).json({ status: "success" });
    }

    if (action === "clear_logs") {
        executionLogs = [];
        return res.status(200).json({ status: "success" });
    }

    res.status(404).json({ error: "Endpoint_Not_Found" });
};
