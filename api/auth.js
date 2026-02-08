const axios = require('axios');
let usersDB = []; 

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1469998225472880662/fQ8_e1mjU3-lFm-WU-qIbNTQ06CXjrXeiazo_o5uNPXBwWVCrI6w-SjDStPeBjCb5B11";

async function sendLog(title, message, color) {
    try {
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{
                title: title,
                description: "```" + message + "```",
                color: color,
                timestamp: new Date()
            }]
        });
    } catch (e) {}
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

    const { action, nickname, password, license, keyExpired, robloxName } = req.body;

    if (action === "register") {
        const exists = usersDB.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());
        if (exists) {
            return res.status(400).json({ status: "error", message: "User already exists" });
        }

        usersDB.push({ nickname, password, license });
        await sendLog("New Registration", `Nick: ${nickname}\nLicense: ${license}\nRoblox: ${robloxName}`, 65280);
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const userIndex = usersDB.findIndex(u => u.nickname === nickname && u.password === password);
        
        if (userIndex === -1) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (keyExpired) {
            usersDB.splice(userIndex, 1);
            await sendLog("Account Deleted", `User: ${nickname}\nReason: Expired License`, 16711680);
            return res.status(410).json({ message: "Expired Key" });
        }

        await sendLog("Login Attempt", `User: ${nickname}\nRoblox: ${robloxName}`, 255);
        return res.status(200).json({ 
            status: "success", 
            license: usersDB[userIndex].license 
        });
    }

    res.status(404).send('');
};
