const https = require('https');
let usersDB = []; 

const SCRIPTS_BY_GAME = {
    "135856908115931": "https://raw.githubusercontent.com/therealroier/ScriptDz/refs/heads/main/DUELS",
    "74084441161738": "https://raw.githubusercontent.com/therealroier/ScriptDz/refs/heads/main/DUELS",
    "131117978948830": "https://raw.githubusercontent.com/therealroier/ScriptDz/refs/heads/main/DUELS"
};

const DISCORD_WEBHOOK = "/api/webhooks/1469998225472880662/fQ8_e1mjU3-lFm-WU-qIbNTQ06CXjrXeiazo_o5uNPXBwWVCrI6w-SjDStPeBjCb5B11";

function sendLog(title, message, color) {
    const data = JSON.stringify({
        embeds: [{
            title: title,
            description: "```" + message + "```",
            color: color,
            timestamp: new Date()
        }]
    });
    const options = {
        hostname: 'discord.com',
        port: 443,
        path: DISCORD_WEBHOOK,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
        },
    };
    const req = https.request(options);
    req.write(data);
    req.end();
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer DZisthegoat') {
        return res.status(403).json({ message: "Forbidden" });
    }

    const userAgent = req.headers['user-agent'] || '';
    if (req.method !== 'POST' || userAgent.includes('Mozilla')) {
        return res.status(404).send(''); 
    }

    const { action, nickname, password, license, keyExpired, robloxName, placeId } = req.body;

    if (action === "register") {
        const exists = usersDB.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());
        if (exists) {
            return res.status(400).json({ status: "error", message: "User already exists" });
        }
        usersDB.push({ nickname, password, license });
        sendLog("New Registration", "Nick: " + nickname + "\nLicense: " + license + "\nRoblox: " + robloxName, 65280);
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const userIndex = usersDB.findIndex(u => u.nickname === nickname && u.password === password);
        if (userIndex === -1) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (keyExpired) {
            usersDB.splice(userIndex, 1);
            sendLog("Account Deleted", "User: " + nickname + "\nReason: Expired License", 16711680);
            return res.status(410).json({ message: "Expired Key" });
        }

        const scriptToLoad = SCRIPTS_BY_GAME[String(placeId)];
        if (!scriptToLoad) {
            return res.status(403).json({ message: "Game not supported" });
        }

        sendLog("Login Success", "User: " + nickname + "\nGame ID: " + placeId + "\nRoblox: " + robloxName, 255);
        return res.status(200).json({ 
            status: "success", 
            license: usersDB[userIndex].license,
            scriptUrl: scriptToLoad
        });
    }
    res.status(404).send('');
};
