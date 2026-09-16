"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  TruckIcon,
  MapPinIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { getMyOrder } from "@/lib/utils/api/routes/orders";

const money = (n) =>
  typeof n === "number" ? `$${n.toLocaleString("es-CO")}` : "$0";

const SHIP_LABEL = {
  PENDIENTE: { text: "Preparando", cls: "bg-(--bg-soft) text-(--text-muted)" },
  ASIGNADO_TRANSPORTADORA: {
    text: "Despachado",
    cls: "bg-(--brand-accent)/15 text-(--brand-accent)",
  },
  EN_CAMINO: {
    text: "En camino",
    cls: "bg-(--brand-accent)/15 text-(--brand-accent)",
  },
  ENTREGADO: { text: "Entregado", cls: "bg-(--success)/15 text-(--success)" },
  DEVUELTO: { text: "Devuelto", cls: "bg-(--danger)/15 text-(--danger)" },
  FALLIDO: { text: "No entregado", cls: "bg-(--danger)/15 text-(--danger)" },
};

const PAYMENT_LABEL = {
  PAGADA: { text: "Pagado", cls: "bg-(--success)/15 text-(--success)" },
  PENDIENTE: {
    text: "Pendiente de pago",
    cls: "bg-(--warning)/15 text-(--warning)",
  },
  RECHAZADA: { text: "Rechazado", cls: "bg-(--danger)/15 text-(--danger)" },
  ANULADO: { text: "Anulado", cls: "bg-(--danger)/15 text-(--danger)" },
};

const METHOD_LABEL = {
  EFECTIVO: "Contra entrega",
  TRANSFERENCIA: "Pago en línea",
};

export default function OrderDetailModal({ code, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getMyOrder(code);
        if (alive) setOrder(res?.data || null);
      } catch (e) {
        if (alive) setError(e?.message || "No se pudo cargar el pedido.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [code]);

  if (!mounted) return null;

  const ship = order ? SHIP_LABEL[order.shippingStatus] : null;
  const pay = order ? PAYMENT_LABEL[order.paymentStatus] : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-(--bg-page) shadow-2xl sm:rounded-3xl"
        >
          {/* Cabecera */}
          <div className="flex items-start justify-between gap-3 bg-gradient-to-br from-(--brand-primary) to-(--brand-secondary) px-6 py-5 text-(--text-inverted)">
            <div>
              <p className="text-xs uppercase tracking-wide opacity-80">
                Detalle del pedido
              </p>
              <h2 className="text-lg font-bold leading-tight">
                {code}
              </h2>
              {order?.saleDate && (
                <p className="mt-0.5 text-sm opacity-90">
                  {new Date(order.saleDate).toLocaleString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-full p-1.5 transition hover:bg-white/15"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-6">
            {error ? (
              <p className="py-8 text-center text-sm text-(--danger)">{error}</p>
            ) : !order ? (
              <p className="py-8 text-center text-sm text-(--text-muted)">
                Cargando pedido…
              </p>
            ) : (
              <div className="space-y-5">
                {/* Estados */}
                <div className="flex flex-wrap gap-2">
                  {ship && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${ship.cls}`}
                    >
                      <TruckIcon className="h-3.5 w-3.5" />
                      {ship.text}
                    </span>
                  )}
                  {pay && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${pay.cls}`}
                    >
                      <CreditCardIcon className="h-3.5 w-3.5" />
                      {pay.text}
                    </span>
                  )}
                </div>

                {/* Productos */}
                <div className="rounded-2xl border border-(--border-soft) p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Productos
                  </p>
                  <div className="divide-y divide-(--border-soft)">
                    {order.items?.map((it, i) => (
                      <div
                        key={i}
                        className="flex justify-between gap-3 py-2 text-sm"
                      >
                        <span className="text-(--text-secondary)">
                          {it.name}
                          {it.color ? ` · ${it.color}` : ""}{" "}
                          <span className="text-(--text-muted)">
                            x{it.quantity}
                          </span>
                        </span>
                        <span className="whitespace-nowrap font-medium text-(--text-primary)">
                          {money(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totales */}
                <div className="space-y-1 text-sm">
                  {order.subtotal != null && (
                    <div className="flex justify-between text-(--text-secondary)">
                      <span>Subtotal</span>
                      <span>{money(order.subtotal)}</span>
                    </div>
                  )}
                  {order.shippingCost != null && (
                    <div className="flex justify-between text-(--text-secondary)">
                      <span>Envío</span>
                      <span>
                        {order.shippingCost === 0
                          ? "Gratis"
                          : money(order.shippingCost)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-(--border-soft) pt-2 text-base font-bold text-(--text-primary)">
                    <span>Total</span>
                    <span>{money(order.total)}</span>
                  </div>
                </div>

                {/* Datos de entrega / pago */}
                <div className="grid grid-cols-1 gap-3 rounded-2xl bg-(--bg-soft) p-4 text-sm sm:grid-cols-2">
                  <Info label="Cliente" value={order.customerName} />
                  <Info label="Teléfono" value={order.phone} />
                  <Info
                    label="Método de pago"
                    value={METHOD_LABEL[order.paymentMethod] || order.paymentMethod}
                  />
                  <Info label="Entrega" value={order.deliveryLabel} />
                  {order.carrier && (
                    <Info label="Transportadora" value={order.carrier} />
                  )}
                  {order.trackingNumber && (
                    <Info label="Guía" value={order.trackingNumber} />
                  )}
                  {order.address && (
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                        Dirección de envío
                      </p>
                      <p className="mt-0.5 flex items-start gap-1.5 font-medium text-(--text-primary)">
                        <MapPinIcon className="mt-0.5 h-4 w-4 flex-none text-(--brand-accent)" />
                        {order.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-(--border-soft) p-4">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-(--cta-primary) py-3 text-sm font-semibold text-(--text-inverted) transition hover:opacity-90"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
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
