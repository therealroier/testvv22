const axios = require('axios');
let usersDB = []; 

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1469998225472880662/fQ8_e1mjU3-lFm-WU-qIbNTQ06CXjrXeiazo_o5uNPXBwWVCrI6w-SjDStPeBjCb5B11";

async function sendDiscord(title, description, color) {
    try {
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{
                title: title,
                description: "```" + description + "```",
                color: color,
                timestamp: new Date()
            }]
        });
    } catch (e) {
        console.log("Webhook Error");
    }
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

    const { action, nickname, password, license, keyExpired, userId, username, placeId, jobId } = req.body;

    if (action === "ping") {
        console.log(`[PING] ${username} is active in Place: ${placeId}`);
        return res.status(200).json({ status: "alive" });
    }

    if (action === "register") {
        const exists = usersDB.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());
        if (exists) return res.status(400).json({ message: "User exists" });

        usersDB.push({ nickname, password, license });
        await sendDiscord("New Registration", `User: ${nickname}\nLicense: ${license}\nRoblox: ${username}`, 65280);
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const userIndex = usersDB.findIndex(u => u.nickname === nickname && u.password === password);
        if (userIndex === -1) return res.status(401).json({ message: "Invalid" });

        if (keyExpired) {
            usersDB.splice(userIndex, 1);
            await sendDiscord("License Expired", `User: ${nickname}\nAction: Deleted from DB`, 16711680);
            return res.status(410).json({ message: "Expired" });
        }

        await sendDiscord("Login Success", `User: ${nickname}\nRoblox Name: ${username}\nPlace ID: ${placeId}`, 255);
        return res.status(200).json({ status: "success", license: usersDB[userIndex].license });
    }

    res.status(404).send('');
};
