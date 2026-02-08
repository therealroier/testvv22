module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        const { Username, Key, Licencia } = req.body;
        
        console.log("--- NUEVA ENTRADA ---");
        console.log("Usuario:", Username);
        console.log("Key:", Key);
        console.log("Licencia:", Licencia);
        
        res.status(200).json({
            status: "success",
            user: Username
        });
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
};
