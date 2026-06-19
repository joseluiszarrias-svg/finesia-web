import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type AuditResult = { estado: "OK" | "Revisar" | "Error"; motivo: string };

function auditarMovimiento(m: any): AuditResult {
  if (m.importe < 0) return { estado: "Error", motivo: "Importe negativo." };
  if (!m.tipo || !m.categoria || !m.importe) return { estado: "Error", motivo: "Datos incompletos." };
  if (m.tipo === "Gasto" && m.categoria === "Software" && String(m.tipoIva).startsWith("0")) {
    return { estado: "Revisar", motivo: "Gasto en Software con IVA 0% requiere revisión." };
  }
  return { estado: "OK", motivo: "Cumple reglas básicas." };
}

export async function POST(req: Request) {
  try {
    const { movimiento } = await req.json();

    if (!movimiento) {
      return NextResponse.json({ status: "ERROR", message: "Falta movimiento" }, { status: 400 });
    }

    // 1. CAPA LÓGICA (Reglas locales)
    const resultadoReglas = auditarMovimiento(movimiento);

    // 2. CAPA IA (OpenAI)
    const prompt = `Analiza este movimiento financiero: ${JSON.stringify(movimiento)}. 
    Validación previa: ${resultadoReglas.estado}. 
    Responde estrictamente en JSON: {"estado": "Aprobado" | "Revisar", "motivo": "Explicación breve"}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const auditoriaIA = JSON.parse(completion.choices[0].message.content!);

    // 3. ACTUALIZACIÓN AUTOMÁTICA EN GOOGLE SHEETS
    if (movimiento.ID && process.env.WEBAPP_URL) {
      const response = await fetch(process.env.WEBAPP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "actualizar",
          movimiento: {
            ID: movimiento.ID,
            "AUDITORÍA DE IA (ESTADO)": auditoriaIA.estado,
            "AUDITORÍA DE IA (MOTIVO)": auditoriaIA.motivo,
            "AUDITORÍA DE IA (FECHA)": new Date().toLocaleDateString()
          }
        })
      });

      const dataSheet = await response.json();
      console.log("Respuesta del Google Sheet:", dataSheet);
    }

    return NextResponse.json({ 
      status: "OK", 
      reglas: resultadoReglas, 
      analisisIA: auditoriaIA 
    });

  } catch (error: any) {
    console.error("Error en auditoría:", error);
    return NextResponse.json({ status: "ERROR", message: error.message }, { status: 500 });
  }
}