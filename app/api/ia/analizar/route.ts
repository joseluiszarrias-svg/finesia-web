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

    // PRUEBA: intenta leer la primera hoja del spreadsheet
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: "AQUÍ_TU_ID_DE_GOOGLE_SHEET",
      range: "A1:B2",
    });

    return NextResponse.json({
      status: "OK",
      data: res.data.values || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "ERROR", message: error.message },
      { status: 500 }
    );
  }
}
