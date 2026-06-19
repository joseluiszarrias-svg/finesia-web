import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializamos OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Llamada a tu Apps Script para obtener los datos
    const response = await fetch(process.env.WEBAPP_URL || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();

    // 2. Si la acción es "leer", aplicamos la IA
    if (body.accion === "leer" && data.movimientos) {
      const prompt = `Actúa como un experto auditor fiscal en España. 
      Analiza los siguientes movimientos financieros y determina si son deducibles según la AEAT. 
      Devuelve un JSON con el campo "auditoria" que contenga una lista de objetos con "ESTADO" ("✅ OK" o "⚠️ REVISIÓN") y "MOTIVO". 
      Mantén el orden de los movimientos originales.
      Datos: ${JSON.stringify(data.movimientos)}`;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const auditoria = JSON.parse(aiResponse.choices[0].message.content || "{}");
      
      // 3. Combinamos los datos originales con el análisis de la IA
      data.movimientos = data.movimientos.map((m: any, i: number) => ({
        ...m,
        ESTADO_AUDITORIA: auditoria.auditoria[i]?.ESTADO || "✅ OK",
        MOTIVO: auditoria.auditoria[i]?.MOTIVO || "Sin observaciones"
      }));
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en API:", error);
    return NextResponse.json({ status: "ERROR", message: error.message }, { status: 500 });
  }
}

// Permitimos GET para pruebas rápidas
export async function GET() {
    return NextResponse.json({ message: "API activa. Usa POST para interactuar." });
}