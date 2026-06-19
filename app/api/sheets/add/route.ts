import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validación mínima
    if (!body || !Array.isArray(body.values)) {
      return NextResponse.json(
        { status: "ERROR", message: "Formato inválido. Se espera { values: [...] }" },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ID REAL DE TU HOJA
    const spreadsheetId = "1ujXsOw6LdXVEJvClRdh1FRP4OGNH0WzIN-Bb4G4-5Pg";

    // Pestaña real
    const range = "Datos_CFO!A1";

    // Escribir al final de la hoja
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [body.values],
      },
    });

    return NextResponse.json({
      status: "OK",
      message: "Movimiento añadido correctamente",
      updates: response.data.updates,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "ERROR",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
