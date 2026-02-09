let usersDB = [];
let executionLogs = [];
let onlineStatus = {};
const FINAL_SCRIPT = "https://pastefy.app/a5g4vwd3/raw";

const today = () => new Date().toISOString().slice(0, 10);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, nickname, password } = req.body;
  const now = Date.now();
  const t = today();

  if (action === "fetch_all") {
    const onlineUsers = Object.keys(onlineStatus).filter(
      name => now - onlineStatus[name] < 40000
    ).length;

    return res.status(200).json({
      total: executionLogs.length,
      usersCount: usersDB.length,
      newToday: usersDB.filter(u => u.regDate === t).length,
      online: onlineUsers,
      logs: executionLogs.slice(0, 50),
      users: usersDB.map(u => ({ username: u.username, regDate: u.regDate }))
    });
  }

  if (action === "register") {
    const cleanNick = nickname.trim().toLowerCase();
    if (usersDB.some(u => u.username.toLowerCase() === cleanNick)) {
      return res.status(400).json({ status: "error", message: "UserExists" });
    }

    usersDB.push({
      username: nickname.trim(),
      password: password,
      regDate: t
    });

    return res.status(200).json({ status: "success" });
  }

  if (action === "login") {
    const cleanNick = nickname.trim().toLowerCase();
    const user = usersDB.find(u => u.username.toLowerCase() === cleanNick && u.password === password);

    if (!user) {
      return res.status(401).json({ status: "error", message: "Invalid" });
    }

    onlineStatus[user.username] = now;

    executionLogs.unshift({
      username: user.username,
      time: new Date().toLocaleTimeString(),
      date: t
    });

    if (executionLogs.length > 1000) executionLogs.pop();

    return res.status(200).json({ 
      status: "success", 
      script: FINAL_SCRIPT 
    });
  }

  res.status(404).json({ error: "ActionNotFound" });
};
