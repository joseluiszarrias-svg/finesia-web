 export default function Home() {
  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>FINESIA Cloud</h1>
      <p>Tu sistema inteligente está funcionando.</p>
      <p>Puedes conectar IA, Supabase y Sheets desde aquí.</p>
    </main>
  );
}

console.log(">>> NEXT_PUBLIC_TEST:", process.env.NEXT_PUBLIC_TEST);

