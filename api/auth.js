let usersDB = []; // Se guardan {username, password, key}
let executionLogs = [];
const FINAL_SCRIPT = "loadstring(game:HttpGet('https://pastefy.app/a5g4vwd3/raw'))()";

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, nickname, password, license } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || '0.0.0.0';

  // DASHBOARD: Obtener todo
  if (action === "fetch_all") {
    return res.status(200).json({ users: usersDB, logs: executionLogs });
  }

  // ROBLOX: Registro (Guarda usuario, pass y key)
  if (action === "register") {
    const userExists = usersDB.some(u => u.username === nickname);
    if (userExists) return res.status(400).json({ status: "error", message: "UserExists" });

    usersDB.push({
      username: nickname,
      password: password,
      key: license,
      timestamp: new Date().toISOString()
    });
    return res.status(200).json({ status: "success" });
  }

  // ROBLOX: Login (Valida y sube Stat)
  if (action === "login") {
    const user = usersDB.find(u => u.username === nickname && u.password === password);

    if (user) {
      // Si el login es correcto, registramos la estadística
      executionLogs.unshift({
        username: user.username,
        timestamp: new Date().toISOString(),
        ip: clientIp
      });

      return res.status(200).json({ 
        status: "success", 
        script: FINAL_SCRIPT 
      });
    }
    return res.status(401).json({ status: "error", message: "Invalid" });
  }

  res.status(404).json({ error: "ActionNotFound" });
};
