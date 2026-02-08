let usersDB = [];

let licensesDB = [
{
id: "1",
key: "ILLUXION-ADMIN-99",
owner: "System",
isActive: true,
type: "Developer",
expiryDate: "2027-01-01",
},
];

let executionLogs = [];

const FINAL_SCRIPT = "[https://pastefy.app/a5g4vwd3/raw](https://pastefy.app/a5g4vwd3/raw)";
const ADMIN_TOKEN = "Bearer DZisthegoat";
const MAX_LOGS = 100;

function addLog(entry) {
executionLogs.unshift(entry);
if (executionLogs.length > MAX_LOGS) executionLogs.pop();
}

function validateLicense(key) {
const lic = licensesDB.find(l => l.key === key);

if (!lic) return { valid: false, reason: "LicenseNotFound" };
if (!lic.isActive) return { valid: false, reason: "LicenseInactive" };

const now = new Date();
const expiry = new Date(lic.expiryDate);

if (expiry < now) return { valid: false, reason: "LicenseExpired" };

return { valid: true, license: lic };
}

module.exports = async (req, res) => {
try {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

```
if (req.method === "OPTIONS") return res.status(200).end();

const authHeader = req.headers["authorization"];
if (authHeader !== ADMIN_TOKEN) {
  return res.status(403).json({ message: "Forbidden" });
}

const { action, nickname, password, license } = req.body || {};
const clientIp = req.headers["x-forwarded-for"] || "0.0.0.0";

if (!action) {
  return res.status(400).json({ error: "MissingAction" });
}

if (action === "fetch_all") {
  return res.status(200).json({
    users: usersDB,
    licenses: licensesDB,
    logs: executionLogs,
  });
}

if (action === "register") {
  if (!nickname || !password || !license) {
    return res.status(400).json({ error: "MissingFields" });
  }

  const cleanNick = nickname.trim().toLowerCase();

  const userExists = usersDB.some(
    u => u.username.toLowerCase() === cleanNick
  );

  if (userExists) {
    return res.status(400).json({
      status: "error",
      message: "UserExists",
    });
  }

  const licenseCheck = validateLicense(license);
  if (!licenseCheck.valid) {
    return res.status(400).json({
      status: "error",
      message: licenseCheck.reason,
    });
  }

  const licenseUsed = usersDB.some(u => u.key === license);
  if (licenseUsed) {
    return res.status(400).json({
      status: "error",
      message: "LicenseUsed",
    });
  }

  const newUser = {
    id: crypto.randomUUID(),
    username: nickname.trim(),
    password,
    key: license,
    timestamp: new Date().toISOString(),
    isActive: true,
  };

  usersDB.push(newUser);

  return res.status(200).json({ status: "success" });
}

if (action === "login") {
  if (!nickname || !password) {
    return res.status(400).json({ error: "MissingFields" });
  }

  const cleanNick = nickname.trim().toLowerCase();

  const user = usersDB.find(
    u =>
      u.username.toLowerCase() === cleanNick &&
      u.password === password &&
      u.isActive
  );

  if (!user) {
    return res.status(401).json({
      status: "error",
      message: "Invalid",
    });
  }

  addLog({
    id: Math.random().toString(36).substr(2, 5),
    username: user.username,
    timestamp: new Date().toISOString(),
    status: "Authorized",
    ip: clientIp,
  });

  return res.status(200).json({
    status: "success",
    license: user.key,
    script: FINAL_SCRIPT,
  });
}

if (action === "delete") {
  if (!nickname) {
    return res.status(400).json({ error: "MissingNickname" });
  }

  const cleanNick = nickname.toLowerCase();

  usersDB = usersDB.filter(
    u => u.username.toLowerCase() !== cleanNick
  );

  return res.status(200).json({ status: "success" });
}

return res.status(404).json({ error: "ActionNotFound" });
```

} catch (err) {
console.error(err);
return res.status(500).json({ error: "ServerError" });
}
};
