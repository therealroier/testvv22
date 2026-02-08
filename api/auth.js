export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { action, nickname, password, license } = req.body;
  const authHeader = req.headers.authorization;

  // Validación de Seguridad
  if (authHeader !== 'Bearer DZisthegoat') {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // --- BASE DE DATOS MOCK (Aquí deberías conectar MongoDB/Supabase) ---
  // Para este ejemplo, usaremos lógica simulada:
  
  switch (action) {
    case "register":
      console.log(`Registrando: ${nickname} con licencia: ${license}`);
      
      // Simulación: Si el nombre es 'admin', decir que ya existe
      if (nickname === "admin") {
        return res.status(400).json({ message: "NicknameTaken" });
      }
      
      // Simulación: Si la licencia es '123', decir que ya está usada
      if (license === "123") {
        return res.status(400).json({ message: "LicenseUsed" });
      }

      return res.status(200).json({ message: "RegisteredSuccessfully" });

    case "login":
      console.log(`Login intento: ${nickname}`);
      
      // IMPORTANTE: Aquí devuelves los datos que el Lua necesita para Junkie
      if (nickname && password) {
        return res.status(200).json({
          status: "success",
          license: license || "KEY-PRO-SIMULATED-123", // La licencia guardada
          script: "print('¡Script de Tsunami Cargado con Éxito!')" // El loadstring final
        });
      }
      return res.status(401).json({ message: "InvalidCredentials" });

    case "delete":
      console.log(`Eliminando cuenta por expiración: ${nickname}`);
      return res.status(200).json({ message: "AccountPurged" });

    default:
      return res.status(400).json({ message: "InvalidAction" });
  }
}
