// app/api/checkout/confirm-payment/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import mercadopago from 'mercadopago';

// Re-configuramos el SDK para poder consultar el estado del pago
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const topic = body.topic || body.type; // A veces viene en 'type', a veces en 'topic'

        // Solo procesamos pagos, ignoramos otros tipos de notificaciones
        if (topic !== 'payment' && topic !== 'payment.created' && topic !== payment.updated) {
            return NextResponse.json({ message: "Notificación ignorada" }, { status: 200 });
        }

        const paymentId = body.id || body.data?.id; // ID del pago que nos envía MP

        if (!paymentId) {
            console.error("Webhook: ID de pago faltante.");
            return NextResponse.json({ message: "ID de pago faltante" }, { status: 400 });
        }

        // 1. Consultar a la API de MP para obtener el estado oficial del pago
        const paymentResponse = await mercadopago.payment.get(paymentId);
        const paymentStatus = paymentResponse.body.status;
        const externalReference = paymentResponse.body.external_reference; // Es el orderId de Supabase
        
        // 2. Mapeo de status de MP a Supabase
        let newOrderStatus;
        if (paymentStatus === 'approved') {
            newOrderStatus = 'paid';
        } else if (paymentStatus === 'pending') {
            newOrderStatus = 'pending';
        } else {
            newOrderStatus = 'failed';
        }

        // 3. Actualizar la orden en Supabase (usando el orderId de external_reference)
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: newOrderStatus, mp_payment_id: paymentId })
            .eq('id', externalReference)
            .eq('status', 'pending'); // Solo actualizamos si estaba pendiente

        if (updateError) {
            console.error(`Webhook: Error al actualizar la orden ${externalReference}:`, updateError);
            return NextResponse.json({ message: "Error interno al actualizar la DB" }, { status: 500 });
        }

        // MP espera un 200 OK para confirmar que recibimos la notificación
        return NextResponse.json({ message: `Orden ${externalReference} actualizada a ${newOrderStatus}` }, { status: 200 });

    } catch (error) {
        console.error("Error al procesar el Webhook:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
}