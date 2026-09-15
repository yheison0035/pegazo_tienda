"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const money = (n) =>
  typeof n === "number" ? `$${n.toLocaleString("es-CO")}` : "$0";

const DELIVERY_LABEL = {
  shipping: "Envío a domicilio",
  local_delivery: "Domicilio",
  pickup: "Recoger en tienda",
  dine_in: "En el lugar",
};

export default function CheckoutResultClient() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id");
  const orderCode = searchParams.get("order");

  const [status, setStatus] = useState(
    transactionId ? "loading" : orderCode ? "order" : "loading",
  );
  const [summary, setSummary] = useState(null);

  // Resumen de la compra guardado en el checkout (sobrevive el viaje a Wompi).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pegazo_last_order");
      if (raw) {
        const s = JSON.parse(raw);
        if (!orderCode || !s.code || s.code === orderCode) setSummary(s);
      }
    } catch {
      /* ignore */
    }
  }, [orderCode]);

  // Confirma el pago con Wompi (y finaliza el pedido) con reintentos.
  useEffect(() => {
    if (!transactionId) return;
    let cancelled = false;
    let tries = 0;
    const check = async () => {
      tries += 1;
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(
          /\/$/,
          "",
        );
        const res = await fetch(`${API_URL}/wompi/confirm/${transactionId}`);
        const data = await res.json();
        const s = data?.status || data?.data?.status;
        if (cancelled) return;
        if (s === "APPROVED") return setStatus("approved");
        if (s === "DECLINED" || s === "ERROR" || s === "VOIDED")
          return setStatus("declined");
        if (tries < 5) return setTimeout(check, 3000);
        setStatus("pending");
      } catch {
        if (cancelled) return;
        if (tries < 5) return setTimeout(check, 3000);
        setStatus("pending");
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
  const code = summary?.code || orderCode;

  const HEAD = {
    approved: { color: "--success", icon: "✓", title: "¡Pago aprobado!" },
    order: { color: "--success", icon: "✓", title: "¡Pedido confirmado!" },
    pending: {
      color: "--warning",
      icon: "…",
      title: "Estamos confirmando tu pago",
    },
    declined: { color: "--danger", icon: "✕", title: "El pago no se completó" },
    loading: { color: "--brand-accent", icon: "", title: "Procesando pago" },
  }[status];

  const SUBTITLE = {
    approved:
      "Tu pago fue procesado correctamente. Te enviamos un correo con la confirmación y el detalle de tu pedido.",
    order:
      "Recibimos tu pedido. Te contactaremos para coordinar la entrega; pagas al recibir. Te enviamos un correo con el detalle.",
    pending:
      "Tu pago se está validando. En cuanto se confirme te llegará un correo con tu pedido. No es necesario volver a pagar.",
    declined:
      "No pudimos procesar tu pago (fondos, tarjeta o banco). No se te cobró. Puedes reintentar o pagar contra entrega.",
    loading: "Estamos validando tu pago, un momento por favor…",
  }[status];

  return (
    <div className="flex min-h-screen items-start justify-center bg-(--bg-muted) px-4 py-10">
      <div className="w-full max-w-xl space-y-4">
        {/* Tarjeta de estado */}
        <div className="rounded-2xl border border-(--border-soft) bg-(--bg-page) p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
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
          <h1
            className="mb-2 text-2xl font-bold"
            style={{ color: `var(${HEAD.color})` }}
          >
            {HEAD.title}
          </h1>
          <p className="text-sm text-(--text-muted)">{SUBTITLE}</p>
          {code && (isSuccess || isPending) && (
            <p className="mt-3 inline-block rounded-full bg-(--bg-soft) px-3 py-1 text-sm font-semibold text-(--text-primary)">
              Pedido {code}
            </p>
          )}
        </div>

        {/* Comprobante / detalle de la compra */}
        {summary && (isSuccess || isPending) && (
          <div
            id="receipt"
            className="rounded-2xl border border-(--border-soft) bg-(--bg-page) p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-(--text-primary)">
                  {summary.store || "Comprobante"}
                </p>
                <p className="text-xs text-(--text-muted)">
                  Pedido {summary.code} ·{" "}
                  {summary.createdAt
                    ? new Date(summary.createdAt).toLocaleString("es-CO")
                    : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isPending
                    ? "bg-(--warning)/15 text-(--warning)"
                    : "bg-(--success)/15 text-(--success)"
                }`}
              >
                {isPending ? "Pago en validación" : "Pagado / Confirmado"}
              </span>
            </div>

            {/* Productos */}
            <div className="divide-y divide-(--border-soft) border-y border-(--border-soft)">
              {summary.items?.map((it, i) => (
                <div key={i} className="flex justify-between gap-3 py-2 text-sm">
                  <span className="text-(--text-secondary)">
                    {it.name}
                    {it.color ? ` · ${it.color}` : ""}{" "}
                    <span className="text-(--text-muted)">x{it.quantity}</span>
                  </span>
                  <span className="whitespace-nowrap font-medium text-(--text-primary)">
                    {money(it.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="mt-3 space-y-1 text-sm">
              <Row label="Subtotal" value={money(summary.subtotal)} />
              <Row
                label="Envío"
                value={
                  summary.shippingCost === 0
                    ? "Gratis"
                    : money(summary.shippingCost)
                }
              />
              <div className="flex justify-between border-t border-(--border-soft) pt-2 text-base font-bold text-(--text-primary)">
                <span>Total</span>
                <span>{money(summary.total)}</span>
              </div>
            </div>

            {/* Datos de entrega / pago */}
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Info label="Cliente" value={summary.customerName} />
              <Info label="Teléfono" value={summary.phone} />
              <Info
                label="Entrega"
                value={DELIVERY_LABEL[summary.deliveryMethod] || "—"}
              />
              <Info label="Pago" value={summary.paymentMethod} />
              {summary.address && (
                <div className="sm:col-span-2">
                  <Info label="Dirección" value={summary.address} />
                </div>
              )}
            </div>

            {/* Descargar comprobante */}
            <button
              onClick={() => window.print()}
              className="cr-noprint mt-5 w-full rounded-lg border border-(--border-soft) py-2.5 text-sm font-semibold text-(--text-secondary) transition hover:bg-(--bg-soft)"
            >
              🧾 Descargar / imprimir comprobante
            </button>
          </div>
        )}

        {/* Acciones */}
        <div className="cr-noprint flex flex-col gap-2">
          {isDeclined && (
            <a
              href="/checkout"
              className="w-full rounded-lg bg-(--cta-primary) py-3 text-center font-semibold text-(--text-inverted) transition hover:opacity-90"
            >
              Reintentar el pago
            </a>
          )}
          <a
            href="/"
            className={`w-full rounded-lg py-3 text-center font-semibold transition ${
              isDeclined
                ? "border border-(--border-soft) text-(--text-secondary) hover:bg-(--bg-soft)"
                : "bg-(--cta-primary) text-(--text-inverted) hover:opacity-90"
            }`}
          >
            {isDeclined ? "Volver a la tienda" : "Seguir comprando"}
          </a>
          {transactionId && (
            <p className="text-center text-xs text-(--text-muted)">
              ID de transacción: {transactionId}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes crSpin { to { transform: rotate(360deg); } }
        .cr-spin { animation: crSpin .8s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .cr-spin { animation: none; } }
        @media print {
          body { background: #fff; }
          .cr-noprint { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-(--text-secondary)">
      <span>{label}</span>
      <span className="font-medium text-(--text-primary)">{value}</span>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-(--text-muted)">
        {label}
      </p>
      <p className="font-medium text-(--text-primary)">{value || "—"}</p>
    </div>
  );
}
