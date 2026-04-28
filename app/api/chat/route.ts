// Chatbot desactivado para liberar el build de Vercel
export async function POST(req: Request) {
  console.log('[Consul API] Solicitud bloqueada: Chatbot desactivado');

  return new Response(
    JSON.stringify({ 
      error: "El asistente Consul se encuentra en mantenimiento temporal. Por favor, comunicate por WhatsApp para turnos o consultas." 
    }),
    { 
      status: 503, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}