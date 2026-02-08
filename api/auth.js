import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const RAW_SCRIPT_URL = "https://pastefy.app/a5g4vwd3/raw";

export default async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer DZisthegoat') {
        return res.status(403).json({ message: "Forbidden" });
    }

    const { action, nickname, password, license, keyExpired } = req.body;
    const userKey = `user:${nickname.toLowerCase()}`;

    if (action === "register") {
        const exists = await kv.get(userKey);
        if (exists) {
            return res.status(400).json({ status: "error", message: "User already exists" });
        }

        await kv.set(userKey, { nickname, password, license });
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const user = await kv.get(userKey);
        
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (keyExpired) {
            await kv.del(userKey);
            return res.status(410).json({ message: "Expired Key" });
        }

        return res.status(200).json({ 
            status: "success", 
            license: user.license,
            scriptUrl: RAW_SCRIPT_URL
        });
    }

    res.status(404).send('');
};
