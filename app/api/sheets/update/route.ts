import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { rowNumber, values } = body;

    if (!rowNumber || !Array.isArray(values)) {
      return NextResponse.json(
        { status: "ERROR", message: "Se requiere { rowNumber, values }" },
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

    const spreadsheetId = "1ujXsOw6LdXVEJvClRdh1FRP4OGNH0WzIN-Bb4G4-5Pg";

    // Rango exacto de la fila a actualizar
    const range = `Datos_CFO!A${rowNumber}:Q${rowNumber}`;

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
      },
    });

    return NextResponse.json({
      status: "OK",
      message: `Fila ${rowNumber} actualizada correctamente`,
      updates: response.data.updatedCells,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "ERROR", message: error.message },
      { status: 500 }
    );
  }
}
