import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, Payment } from 'mercadopago';

// 1. Nueva forma de configurar el cliente en la Versión 2
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        
        // A veces viene en 'type', a veces en 'topic'
        const topic = body.topic || body.type; 

        // Corregido: Agregadas comillas y el signo ! que faltaban
        if (topic !== 'payment' && topic !== 'payment.created' && topic !== 'payment.updated') {
            return NextResponse.json({ message: "Notificación ignorada" }, { status: 200 });
        }

        const paymentId = body.id || body.data?.id; 

        if (!paymentId) {
            console.error("Webhook: ID de pago faltante.");
            return NextResponse.json({ message: "ID de pago faltante" }, { status: 400 });
        }

        // 2. Nueva forma de consultar el pago
        const payment = new Payment(client);
        const paymentResponse = await payment.get({ id: paymentId });
        
        const paymentStatus = paymentResponse.status;
        const externalReference = paymentResponse.external_reference; 
        
        // 3. Mapeo de status
        let newOrderStatus;
        if (paymentStatus === 'approved') {
            newOrderStatus = 'paid';
        } else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
            newOrderStatus = 'pending';
        } else {
            newOrderStatus = 'failed';
        }

        // 4. Actualizar la orden en Supabase
        const { error: updateError } = await supabase
            .from('orders')
            .update({ 
                status: newOrderStatus, 
                mp_payment_id: String(paymentId) 
            })
            .eq('id', externalReference)
            .eq('status', 'pending');

        if (updateError) {
            console.error(`Webhook: Error al actualizar la orden ${externalReference}:`, updateError);
            return NextResponse.json({ message: "Error interno al actualizar la DB" }, { status: 500 });
        }

        return NextResponse.json({ message: `Orden ${externalReference} actualizada a ${newOrderStatus}` }, { status: 200 });

    } catch (error) {
        console.error("Error al procesar el Webhook:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
}