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

    const { action, nickname, password, license } = req.body;
    const lowerNick = nickname ? nickname.toLowerCase().trim() : null;

    if (action === "register") {
        const { error } = await supabase
            .from('whitelist')
            .insert([{ username: lowerNick, password: password, license: license }]);
        if (error) return res.status(400).json({ status: "error", message: error.code === '23505' ? "Existente" : error.message });
        return res.status(200).json({ status: "success" });
    }

    if (action === "login") {
        const { data: user, error } = await supabase
            .from('whitelist')
            .select('*')
            .eq('username', lowerNick)
            .eq('password', password)
            .single();
        if (error || !user) return res.status(401).json({ status: "error", message: "Auth Failed" });
        return res.status(200).json({ status: "success", license: user.license, script: FINAL_SCRIPT });
    }

    if (action === "renew") {
        const { error } = await supabase
            .from('whitelist')
            .update({ license: license })
            .eq('username', lowerNick);
        if (error) return res.status(500).json({ status: "error", message: error.message });
        return res.status(200).json({ status: "success" });
    }

    res.status(404).json({ message: "Not Found" });
};
