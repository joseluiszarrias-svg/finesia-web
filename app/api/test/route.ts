import { NextResponse } from "next/server";
import { leerMovimientos } from "@/lib/sheets";

export async function GET() {
  console.log(">>> EJECUTANDO GET /api/test");

  try {
    const data = await leerMovimientos();
    console.log(">>> RESPUESTA DEL WEBAPP:", data);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(">>> ERROR EN leerMovimientos:", err);
    return NextResponse.json({ status: "ERROR", message: err.message }, { status: 500 });
  }
}
