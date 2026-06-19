import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!clientEmail || !privateKey) {
  throw new Error("Faltan GOOGLE_CLIENT_EMAIL o GOOGLE_PRIVATE_KEY en .env.local");
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});


    const sheets = google.sheets({ version: "v4", auth });

    // ID REAL DE TU HOJA
    const spreadsheetId = "1ujXsOw6LdXVEJvClRdh1FRP4OGNH0WzIN-Bb4G4-5Pg";

    // NOMBRE REAL DE LA PESTAÑA
    const range = "Datos_CFO!A1:Z5000";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    return NextResponse.json({
      status: "OK",
      total: rows.length - 1,
      headers: rows[0],
      data: rows.slice(1),
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
