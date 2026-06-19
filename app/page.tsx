"use client";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function analizar() {
    setLoading(true);
    try {
      const res = await fetch("/api/ia/analizar", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error al analizar:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "system-ui", color: "white", background: "#05060a", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 32 }}>
        FINESIA Cloud · <span style={{ color: "#00C8FF" }}>Demo conectada</span>
      </h1>
      <p style={{ opacity: 0.7, maxWidth: 520 }}>
        Esta demo ejecuta un flujo completo: IA → Base de datos → Google Sheets.
      </p>

      <button
        onClick={analizar}
        style={{
          marginTop: 20,
          padding: "12px 22px",
          borderRadius: 12,
          background: "linear-gradient(135deg,#00C8FF,#00FF9D)",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          color: "#05060a"
        }}
      >
        Ejecutar análisis completo
      </button>

      {loading && <p style={{ marginTop: 20 }}>Analizando con IA…</p>}

      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>Resultado IA</h2>
          <pre style={{ background: "#0B0D16", padding: 20, borderRadius: 12, marginTop: 10, fontSize: 12, overflowX: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}