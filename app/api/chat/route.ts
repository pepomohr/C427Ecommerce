import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Permitimos respuestas de hasta 30 segundos
export const maxDuration = 30;

const SYSTEM_PROMPT = `Sos Consul, el asistente personal experto de **C427** Medicina Estética. 
Tu objetivo es asesorar a los pacientes sobre rutinas de skincare y tratamientos.
Sé profesional, amable y respondé siempre como un asistente masculino ("Consul"). Si preguntan precios o turnos, derivá a WhatsApp.
Siempre recomendá que complementen con tratamientos del consultorio, pueden sacar turno en whatsapp.`;

export async function POST(req: Request) {
  console.log('[Consul API] Solicitud recibida');

  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response('Mensajes inválidos', { status: 400 });
    }

    console.log('[Consul API] Mensajes:', messages.length, '| Último:', messages.at(-1)?.content?.slice(0, 40));

    // En ai@4.x: streamText devuelve una Promise — usar await
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      messages,
      onFinish: ({ text, finishReason, usage }) => {
        console.log('[Consul API] ✓ Finalizado | Razón:', finishReason, '| Chars:', text.length, '| Tokens:', usage);
      },
    });

    console.log('[Consul API] Stream iniciado, enviando respuesta...');

    // toDataStreamResponse() existe y funciona en ai@4.x
    // sendExtraMessageFields: true evita que se pierdan campos del mensaje
    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error('[Consul API] Error en stream (getErrorMessage):', error);
        if (error instanceof Error) return error.message;
        return 'Error desconocido en el stream';
      },
    });

  } catch (error: unknown) {
    console.error('[Consul API] Error:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}