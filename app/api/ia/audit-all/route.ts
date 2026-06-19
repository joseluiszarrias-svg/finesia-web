import { NextResponse } from "next/server";
import { google } from "googleapis";

// Motor de auditoría (el mismo que ya tienes)
function auditarMovimiento(m: any) {
  const categoriasConIvaHabitual = ["Software", "Marketing", "Viajes", "Suscripciones", "Consultoría"];
  const ivaEsCero = m.tipoIva.startsWith("0");
  const iva21 = m.tipoIva.includes("21");

  if (!m.tipo || !m.categoria || !m.importe || !m.tipoIva) {
    return { estado: "Error", motivo: "Faltan datos clave." };
  }

  if (m.tipo === "Gasto" && ivaEsCero && categoriasConIvaHabitual.includes(m.categoria)) {
    return { estado: "Revisar", motivo: `Gasto en ${m.categoria} con IVA 0%.` };
  }

  if (m.tipo === "Ingreso" && ivaEsCero && m.categoria === "Servicios") {
    return { estado: "Revisar", motivo: "Ingreso con IVA 0% en Servicios." };
  }

  if (m.importe < 0) {
    return { estado: "Error", motivo: "Importe negativo." };
  }

  if (m.tipo === "Gasto" && iva21 && categoriasConIvaHabitual.includes(m.categoria)) {
    return { estado: "OK", motivo: "Gasto correcto con IVA 21%." };
  }

  if (m.tipo === "Ingreso" && iva21) {
    return { estado: "OK", motivo: "Ingreso correcto con IVA 21%." };
  }

  return { estado: "Revisar", motivo: "Caso no estándar." };
}

export async function POST() {
  try {
    // Autenticación Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "1ujXsOw6LdXVEJvClRdh1FRP4OGNH0WzIN-Bb4G4-5Pg";
    const range = "Datos_CFO!A1:Q5000";

    // 1. Leer todos los movimientos
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = res.data.values || [];

    const headers = rows[0];
    const data = rows.slice(1);

    const colEstado = headers.indexOf("AUDITORÍA DE IA (ESTADO)");

    if (colEstado === -1) {
      return NextResponse.json({ status: "ERROR", message: "No existe la columna de auditoría." });
    }

    let cambios = 0;

    // 2. Recorrer cada fila
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const movimiento = {
        tipo: row[3],
        categoria: row[4],
        subcategoria: row[5],
        importe: parseFloat(row[6]),
        tipoIva: row[14],
      };

      const resultado = auditarMovimiento(movimiento);

      // 3. Actualizar solo si cambia
      if (row[colEstado] !== resultado.estado) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Datos_CFO!${String.fromCharCode(65 + colEstado)}${i + 2}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[resultado.estado]] },
        });

        cambios++;
      }
    }

    return NextResponse.json({
      status: "OK",
      message: "Auditoría completada",
      filasAuditadas: data.length,
      cambiosRealizados: cambios,
    });

  } catch (error: any) {
    return NextResponse.json({ status: "ERROR", message: error.message }, { status: 500 });
  }
}
