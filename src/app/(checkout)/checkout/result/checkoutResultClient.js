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
        // /wompi/confirm consulta el estado REAL en Wompi y, si está aprobado,
        // finaliza el pedido (respaldo por si el webhook no llegó).
        const res = await fetch(`${API_URL}/wompi/confirm/${transactionId}`);
        const data = await res.json();
        const s = data?.status || data?.data?.status;
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

  const isSuccess = status === "approved" || status === "order";
  const isBusy = status === "loading";
  const isPending = status === "pending";
  const isDeclined = status === "declined";

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg-muted) px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-(--border-soft) bg-(--bg-page) p-8 text-center shadow-sm">
        {/* Ícono según estado */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          {isSuccess && (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--success)/15 text-3xl text-(--success)">
              ✓
            </span>
          )}
          {(isBusy || isPending) && (
            <span className="cr-spin h-12 w-12 rounded-full border-4 border-(--brand-accent)/25 border-t-(--brand-accent)" />
          )}
          {isDeclined && (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--danger)/15 text-3xl text-(--danger)">
              ✕
            </span>
          )}
        </div>

        {status === "order" && (
          <>
            <h1 className="mb-2 text-2xl font-bold text-(--success)">
              ¡Pedido confirmado!
            </h1>
            <p className="text-sm text-(--text-muted)">
              Te contactaremos para coordinar la entrega. Pagas al recibir.
            </p>
          </>
        )}

        {isBusy && (
          <>
            <h1 className="mb-2 text-2xl font-bold text-(--text-primary)">
              Procesando pago
            </h1>
            <p className="text-sm text-(--text-muted)">
              Estamos validando tu pago. Un momento por favor…
            </p>
          </>
        )}

        {status === "approved" && (
          <>
            <h1 className="mb-2 text-2xl font-bold text-(--success)">
              ¡Pago aprobado!
            </h1>
            <p className="text-sm text-(--text-muted)">
              Tu pago fue procesado correctamente. Te enviamos un correo con la
              confirmación de tu pedido.
            </p>
          </>
        )}

        {isPending && (
          <>
            <h1 className="mb-2 text-2xl font-bold text-(--warning)">
              Estamos confirmando tu pago
            </h1>
            <p className="text-sm text-(--text-muted)">
              Tu pago se está validando. En cuanto se confirme te llegará un
              correo con tu pedido. <b>No es necesario volver a pagar.</b>
            </p>
          </>
        )}

        {isDeclined && (
          <>
            <h1 className="mb-2 text-2xl font-bold text-(--danger)">
              El pago no se completó
            </h1>
            <p className="text-sm text-(--text-muted)">
              No pudimos procesar tu pago (puede ser por fondos, la tarjeta o el
              banco). No se te cobró. Puedes intentarlo de nuevo o pagar contra
              entrega.
            </p>
          </>
        )}

        {orderCode && (isSuccess || isPending) && (
          <p className="mt-3 text-sm font-semibold text-(--text-primary)">
            Pedido {orderCode}
          </p>
        )}

        {/* Acciones según estado */}
        <div className="mt-6 flex flex-col gap-2">
          {isDeclined && (
            <a
              href="/checkout"
              className="w-full rounded-lg bg-(--cta-primary) py-3 font-semibold text-(--text-inverted) transition hover:opacity-90"
            >
              Reintentar el pago
            </a>
          )}
          {(isSuccess || isPending) && (
            <a
              href="/"
              className="w-full rounded-lg bg-(--cta-primary) py-3 font-semibold text-(--text-inverted) transition hover:opacity-90"
            >
              Seguir comprando
            </a>
          )}
          <a
            href="/"
            className={`w-full rounded-lg py-3 font-medium transition ${
              isDeclined
                ? "border border-(--border-soft) text-(--text-secondary) hover:bg-(--bg-soft)"
                : "text-(--text-muted) hover:text-(--brand-accent)"
            }`}
          >
            {isDeclined ? "Volver a la tienda" : "Ir al inicio"}
          </a>
        </div>

        {transactionId && (
          <p className="mt-4 text-xs text-(--text-muted)">
            ID de transacción: {transactionId}
          </p>
        )}
      </div>

      <style>{`
        @keyframes crSpin { to { transform: rotate(360deg); } }
        .cr-spin { animation: crSpin .8s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .cr-spin { animation: none; } }
      `}</style>
    </div>
  );
}
