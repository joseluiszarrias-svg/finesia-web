const WEBAPP_URL = process.env.WEBAPP_URL;

// Validación defensiva: si falla, que te lo diga claramente en la consola
if (!WEBAPP_URL) {
  console.error(">>> ERROR: WEBAPP_URL no está cargada en las variables de entorno.");
}

export async function leerMovimientos() {
  if (!WEBAPP_URL) {
    throw new Error("No hay URL de conexión configurada.");
  }

  const res = await fetch(WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accion: "leer" }),
  });

  return res.json();
}