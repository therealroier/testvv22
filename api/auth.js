const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fnngvqinfvrbudsecoru.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubmd2cWluZnZyYnVkc2Vjb3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTI5MTYsImV4cCI6MjA4NjI2ODkxNn0.PlMtd7_UJCIJEg35ioVdiOYghBN_clVrhjdMaYT5JJ4';
const FINAL_SCRIPT = "https://pastefy.app/a5g4vwd3/raw";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action, nickname, password, client } = req.body;
    const now = Math.floor(Date.now() / 1000);

    if (action === "register") {
        const { data: existing } = await supabase.from('whitelist').select('username').eq('client', client).single();
        if (existing) return res.status(400).json({ status: "error", message: "CLIENT ALREADY LINKED" });

        const { error } = await supabase.from('whitelist').insert([{ 
            username: nickname, password: req.body.password, license: req.body.license, client, status: 'Offline', last_heartbeat: 0 
        }]);
        if (error) return res.status(400).json({ status: "error", message: "NICKNAME TAKEN" });
        return res.status(200).json({ status: "success" });
    }

    if (action === "login" || action === "heartbeat") {
        const { data: user } = await supabase.from('whitelist').select('*').eq('username', nickname).eq('password', password).eq('client', client).single();
        if (!user) return res.status(401).json({ status: "error" });

        await supabase.from('whitelist').update({ status: 'Online', last_heartbeat: now }).eq('id', user.id);
        return res.status(200).json({ status: "success", license: user.license, script: FINAL_SCRIPT });
    }

    if (action === "logout") {
        await supabase.from('whitelist').update({ status: 'Offline', last_heartbeat: 0 }).eq('username', nickname).eq('client', client);
        return res.status(200).json({ status: "success" });
    }

    if (action === "check_status") {
        const { data: users } = await supabase.from('whitelist').select('id, last_heartbeat, status');
        for (const u of users) {
            if (u.status === 'Online' && (now - u.last_heartbeat) > 7) {
                await supabase.from('whitelist').update({ status: 'Offline' }).eq('id', u.id);
            }
        }
        return res.status(200).json({ status: "cleaned" });
    }

    res.status(404).json({ message: "Not Found" });
};
