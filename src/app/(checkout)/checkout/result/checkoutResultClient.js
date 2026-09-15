"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutResultClient() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id");
  // Pedido contra entrega: no pasa por Wompi, llega con su código.
  const orderCode = searchParams.get("order");

  // Si viene con transacción de Wompi, arranca en "loading"; si es contra
  // entrega (solo ?order), muestra confirmado.
  const [status, setStatus] = useState(
    transactionId ? "loading" : orderCode ? "order" : "loading",
  );

  useEffect(() => {
    if (!transactionId) return;
    let cancelled = false;
    let tries = 0;

    // Consulta el estado con REINTENTOS: Wompi puede tardar unos segundos en
    // dejar la transacción como APPROVED. Nunca marcamos "rechazado" por un
    // fallo de red o porque aún esté pendiente; para eso está el webhook.
    const check = async () => {
      tries += 1;
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(
          /\/$/,
          "",
        );
        const res = await fetch(
          `${API_URL}/wompi/transaction/${transactionId}`,
        );
        const data = await res.json();
        const s = data?.data?.status;
        if (cancelled) return;
        if (s === "APPROVED") return setStatus("approved");
        if (s === "DECLINED" || s === "ERROR" || s === "VOIDED")
          return setStatus("declined");
        // PENDING u otro: reintenta hasta ~5 veces y si sigue, queda pendiente.
        if (tries < 5) return setTimeout(check, 3000);
        setStatus("pending");
      } catch {
        if (cancelled) return;
        if (tries < 5) return setTimeout(check, 3000);
        setStatus("pending"); // no asustar: el webhook confirmará
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
        {status === "order" && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-green-600">
              ¡Pedido confirmado!
            </h1>
            <p className="text-sm text-gray-500">
              Te contactaremos para coordinar la entrega. Pagas al recibir.
            </p>
            <p className="mt-3 text-sm font-semibold text-gray-700">
              Pedido {orderCode}
            </p>
          </>
        )}

        {status === "loading" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Procesando pago</h1>
            <p className="text-sm text-gray-500">
              Validando transacción con Wompi…
            </p>
          </>
        )}

        {status === "approved" && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-green-600">
              ¡Pago aprobado!
            </h1>
            <p className="text-sm text-gray-500">
              Tu pago fue procesado correctamente. Te enviaremos un correo con la
              confirmación de tu pedido.
            </p>
            {orderCode && (
              <p className="mt-3 text-sm font-semibold text-gray-700">
                Pedido {orderCode}
              </p>
            )}
          </>
        )}

        {status === "pending" && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-amber-600">
              Estamos confirmando tu pago
            </h1>
            <p className="text-sm text-gray-500">
              Tu pago se está validando. En cuanto se confirme te llegará un
              correo con tu pedido. No es necesario volver a pagar.
            </p>
            {orderCode && (
              <p className="mt-3 text-sm font-semibold text-gray-700">
                Pedido {orderCode}
              </p>
            )}
          </>
        )}

        {status === "declined" && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-red-600">
              Pago rechazado
            </h1>
            <p className="text-sm text-gray-500">
              El pago no pudo completarse. Puedes intentarlo de nuevo o elegir
              pago contra entrega.
            </p>
          </>
        )}

        {transactionId && (
          <p className="text-xs text-gray-400 mt-4">
            ID de transacción: {transactionId}
          </p>
        )}
      </div>
    </div>
  );
}
