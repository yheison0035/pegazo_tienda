"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  MapPinIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { trackOrder } from "@/lib/utils/api/routes/orders";

const STEPS = [
  { key: "confirmed", label: "Confirmado", Icon: CheckCircleIcon },
  { key: "packing", label: "Empacando", Icon: ArchiveBoxIcon },
  { key: "shipped", label: "Despachado", Icon: TruckIcon },
  { key: "transit", label: "En camino", Icon: MapPinIcon },
  { key: "delivered", label: "Entregado", Icon: HomeIcon },
];

// Mapea el estado de envío del backend a la posición en la línea de tiempo.
function stepIndexOf(shippingStatus) {
  switch (shippingStatus) {
    case "PENDIENTE":
      return 1; // confirmado + empacando
    case "ASIGNADO_TRANSPORTADORA":
      return 2; // despachado
    case "EN_CAMINO":
      return 3;
    case "ENTREGADO":
      return 4;
    default:
      return 0;
  }
}

const money = (n) =>
  typeof n === "number" ? `$${n.toLocaleString("es-CO")}` : "";
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

export default function TrackOrder() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ref, setRef] = useState("");
  const [document, setDocumentValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  // Guarda la última consulta exitosa para refrescar el estado en tiempo real.
  const pollRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // Deep-link desde el correo: al abrir "Ver mi pedido" (/?pedido=CODE) se abre
  // esta consulta con el número ya puesto; el cliente solo pone su cédula.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("pedido");
      if (code) {
        setRef(code);
        setOpen(true);
        params.delete("pedido");
        const qs = params.toString();
        const clean = window.location.pathname + (qs ? `?${qs}` : "");
        window.history.replaceState({}, "", clean);
      }
    } catch {
      /* noop */
    }
  }, []);

  // Tiempo real: mientras hay un pedido en pantalla, re-consulta su estado en
  // silencio (cada 20s y al volver a la pestaña) para reflejar cambios del CRM.
  useEffect(() => {
    if (!open || !result || !pollRef.current) return;
    let alive = true;
    const refetch = async () => {
      try {
        const res = await trackOrder(pollRef.current);
        if (alive && res?.data) setResult(res.data);
      } catch {
        /* silencioso: no molestar al cliente por un refresco fallido */
      }
    };
    const id = setInterval(refetch, 20000);
    const onVis = () => {
      if (window.document.visibilityState === "visible") refetch();
    };
    window.document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      clearInterval(id);
      window.document.removeEventListener("visibilitychange", onVis);
    };
  }, [open, result?.code]);

  // Bloquea el scroll del fondo mientras el modal está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    pollRef.current = null;
    setTimeout(() => {
      setResult(null);
      setError("");
      setRef("");
      setDocumentValue("");
    }, 200);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!ref.trim() || !document.trim()) {
      setError("Ingresa el número de pedido (o guía) y tu cédula.");
      return;
    }
    setLoading(true);
    try {
      const query = { ref: ref.trim(), document: document.trim() };
      const res = await trackOrder(query);
      pollRef.current = query; // habilita el refresco en tiempo real
      setResult(res.data);
    } catch (err) {
      setError(err.message || "No pudimos consultar tu pedido.");
    } finally {
      setLoading(false);
    }
  };

  const failed = result?.shippingStatus === "FALLIDO";
  const returned = result?.shippingStatus === "DEVUELTO";
  const special = failed || returned;
  const current = result ? stepIndexOf(result.shippingStatus) : 0;
  const progressPct = special ? 100 : (current / (STEPS.length - 1)) * 100;

  const modal = (
    <div
      className="to-overlay fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="to-pop relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-(--bg-page) shadow-2xl ring-1 ring-black/5 sm:rounded-3xl"
        >
          {/* Cabecera */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-(--brand-primary) to-(--brand-secondary) px-6 pb-6 pt-5 text-(--text-inverted)">
          {/* Barra 'carretera' animada al pie de la cabecera */}
          <div className="to-road pointer-events-none absolute inset-x-0 bottom-0 h-1 opacity-60" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <TruckIcon className="to-truck h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold leading-tight">
                  Consultar mi pedido
                </h2>
                <p className="text-sm opacity-90">Sigue tu pedido en tiempo real</p>
              </div>
            </div>
            <button
              onClick={close}
              aria-label="Cerrar"
              className="-mr-1 rounded-full p-1.5 transition hover:bg-white/15"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

          {/* Cuerpo */}
          <div className="px-6 py-6">
          {!result ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex items-start gap-2 rounded-xl bg-(--bg-soft) p-3 text-sm text-(--text-secondary)">
                <ShieldCheckIcon className="h-5 w-5 flex-none text-(--brand-accent)" />
                <span>
                  Por tu seguridad pedimos <b>dos datos</b>: el número de tu
                  pedido o la guía, y tu cédula.
                </span>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
                  Número de pedido o guía
                </label>
                <input
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="Ej: EUR-1699999999 o guía"
                  className="w-full rounded-xl border border-(--border-soft) bg-(--bg-page) px-4 py-3 text-(--text-primary) outline-none transition focus:border-(--brand-accent) focus:ring-2 focus:ring-(--brand-accent)/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
                  Número de cédula
                </label>
                <input
                  value={document}
                  onChange={(e) => setDocumentValue(e.target.value)}
                  inputMode="numeric"
                  placeholder="Tu documento"
                  className="w-full rounded-xl border border-(--border-soft) bg-(--bg-page) px-4 py-3 text-(--text-primary) outline-none transition focus:border-(--brand-accent) focus:ring-2 focus:ring-(--brand-accent)/30"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--cta-primary) py-3.5 font-semibold text-(--text-inverted) shadow-sm transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <span className="to-spin h-5 w-5 rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <MagnifyingGlassIcon className="h-5 w-5" />
                )}
                {loading ? "Buscando…" : "Consultar pedido"}
              </button>
            </form>
          ) : (
            <div className="to-fade space-y-5">
              {/* Encabezado del pedido */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                    Pedido
                  </p>
                  <p className="text-lg font-bold text-(--text-primary)">
                    {result.code}
                  </p>
                  {result.customerName && (
                    <p className="text-sm text-(--text-muted)">
                      {result.customerName}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    pollRef.current = null;
                    setResult(null);
                    setError("");
                  }}
                  className="rounded-lg px-2 py-1 text-sm font-medium text-(--brand-accent) transition hover:bg-(--bg-soft)"
                >
                  Otra consulta
                </button>
              </div>

              {/* Estado especial (no entregado / devuelto) */}
              {special ? (
                <div className="flex items-start gap-3 rounded-2xl border border-(--warning) bg-(--warning)/10 p-4">
                  <ExclamationTriangleIcon className="h-6 w-6 flex-none text-(--warning)" />
                  <div>
                    <p className="font-semibold text-(--text-primary)">
                      {failed
                        ? "No fue posible entregar tu pedido"
                        : "Tu pedido fue devuelto"}
                    </p>
                    <p className="text-sm text-(--text-muted)">
                      {failed
                        ? "Nos comunicaremos contigo para reprogramar la entrega."
                        : "Si tienes dudas, escríbenos y te ayudamos."}
                    </p>
                    {result.notes && (
                      <p className="mt-1 text-sm text-(--text-secondary)">
                        {result.notes}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Línea de tiempo animada */
                <div className="rounded-2xl border border-(--border-soft) p-4">
                  <div className="relative mx-1 mb-4 mt-1 h-1.5 rounded-full bg-(--bg-muted)">
                    <div
                      className="to-fill absolute inset-y-0 left-0 rounded-full bg-(--cta-primary)"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {STEPS.map((s, i) => {
                      const done = i < current;
                      const active = i === current;
                      const StepIcon = s.Icon;
                      return (
                        <div
                          key={s.key}
                          className="flex flex-col items-center text-center"
                        >
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                              done || active
                                ? "border-(--cta-primary) bg-(--cta-primary) text-white"
                                : "border-(--border-strong) bg-(--bg-page) text-(--text-muted)"
                            } ${active ? "to-pulse" : ""}`}
                          >
                            <StepIcon className="h-5 w-5" />
                          </span>
                          <span
                            className={`mt-1.5 text-[11px] leading-tight ${
                              done || active
                                ? "font-semibold text-(--text-primary)"
                                : "text-(--text-muted)"
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pago y envío: desglose y cuánto debe pagar */}
              <div className="rounded-2xl border border-(--border-soft) p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-(--text-muted)">
                  Pago y envío
                </p>

                <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                  {result.deliveryType && (
                    <span className="rounded-full bg-(--bg-muted) px-2.5 py-1 font-medium text-(--text-primary)">
                      {result.deliveryType}
                    </span>
                  )}
                  {result.paymentMethodLabel && (
                    <span className="rounded-full bg-(--bg-muted) px-2.5 py-1 font-medium text-(--text-primary)">
                      {result.paymentMethodLabel}
                    </span>
                  )}
                  {result.paymentStatusLabel && (
                    <span
                      className={`rounded-full px-2.5 py-1 font-semibold ${
                        result.paid
                          ? "bg-(--success)/15 text-(--success)"
                          : "bg-(--warning)/15 text-(--warning)"
                      }`}
                    >
                      {result.paymentStatusLabel}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-sm">
                  {result.subtotal != null && (
                    <div className="flex justify-between text-(--text-secondary)">
                      <span>Subtotal</span>
                      <span>{money(result.subtotal)}</span>
                    </div>
                  )}
                  {result.shippingCost != null && (
                    <div className="flex justify-between text-(--text-secondary)">
                      <span>Envío</span>
                      <span
                        className={
                          result.shippingCost === 0 ? "text-(--success)" : ""
                        }
                      >
                        {result.shippingCost === 0
                          ? "Gratis"
                          : money(result.shippingCost)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-(--border-soft) pt-1.5 font-semibold text-(--text-primary)">
                    <span>Total</span>
                    <span>{money(result.total)}</span>
                  </div>
                </div>

                {/* Cuánto debe pagar */}
                {result.amountToPay > 0 ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-(--cta-primary)/10 px-3 py-2.5">
                    <span className="text-sm font-medium text-(--text-primary)">
                      Debes pagar al recibir
                    </span>
                    <span className="text-lg font-bold text-(--cta-primary)">
                      {money(result.amountToPay)}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl bg-(--success)/10 px-3 py-2.5 text-center text-sm font-semibold text-(--success)">
                    ✓ Este pedido ya está pagado
                  </div>
                )}

                {result.address && (
                  <p className="mt-3 text-xs text-(--text-muted)">
                    <span className="font-medium text-(--text-secondary)">
                      Dirección:
                    </span>{" "}
                    {result.address}
                  </p>
                )}
              </div>

              {/* Datos de envío */}
              {(result.carrier || result.trackingNumber) && (
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-(--border-soft) p-4 text-sm">
                  {result.carrier && (
                    <div>
                      <p className="text-(--text-muted)">Transportadora</p>
                      <p className="font-medium text-(--text-primary)">
                        {result.carrier}
                      </p>
                    </div>
                  )}
                  {result.trackingNumber && (
                    <div>
                      <p className="text-(--text-muted)">Guía</p>
                      <p className="font-medium text-(--text-primary)">
                        {result.trackingNumber}
                      </p>
                    </div>
                  )}
                  {fmtDate(result.shippedAt) && (
                    <div>
                      <p className="text-(--text-muted)">Despachado</p>
                      <p className="font-medium text-(--text-primary)">
                        {fmtDate(result.shippedAt)}
                      </p>
                    </div>
                  )}
                  {fmtDate(result.deliveredAt) && (
                    <div>
                      <p className="text-(--text-muted)">Entregado</p>
                      <p className="font-medium text-(--text-primary)">
                        {fmtDate(result.deliveredAt)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Productos + total */}
              <div className="rounded-2xl border border-(--border-soft) p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-(--text-muted)">
                  Productos
                </p>
                <ul className="space-y-1 text-sm">
                  {result.items?.map((it, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between gap-2 text-(--text-secondary)"
                    >
                      <span className="truncate">{it.name}</span>
                      <span className="flex-none">x{it.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes toOverlay { from { opacity: 0; } to { opacity: 1; } }
        .to-overlay { animation: toOverlay .2s ease both; }
        @keyframes toPop { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: none; } }
        .to-pop { animation: toPop .3s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes toFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .to-fade { animation: toFade .35s ease both; }
        @keyframes toTruck { 0%,100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
        .to-truck { animation: toTruck 1.2s ease-in-out infinite; }
        @keyframes toRoad { from { background-position: 0 0; } to { background-position: 24px 0; } }
        .to-road { background-image: repeating-linear-gradient(90deg,#fff 0 10px,transparent 10px 24px); animation: toRoad .6s linear infinite; }
        @keyframes toFill { from { width: 0; } }
        .to-fill { animation: toFill .8s ease both; }
        @keyframes toPulse { 0%,100% { box-shadow: 0 0 0 0 var(--cta-primary); } 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--cta-primary) 25%, transparent); } }
        .to-pulse { animation: toPulse 1.4s ease-in-out infinite; }
        @keyframes toSpin { to { transform: rotate(360deg); } }
        .to-spin { animation: toSpin .7s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .to-overlay,.to-pop,.to-fade,.to-truck,.to-road,.to-fill,.to-pulse,.to-spin { animation: none; }
        }
      `}</style>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Consultar mi pedido"
        title="Consultar mi pedido"
        className="group flex items-center gap-1.5 rounded-full border border-(--border-soft) px-2.5 py-1.5 text-(--text-primary) transition hover:border-(--brand-accent) hover:bg-(--brand-accent)/10 hover:text-(--brand-accent) sm:border-0 sm:px-2"
      >
        <TruckIcon className="h-6 w-6 transition group-hover:-translate-x-0.5" />
        <span className="text-xs font-medium sm:text-sm">Mi pedido</span>
      </button>

      {open && mounted && createPortal(modal, window.document.body)}
    </>
  );
}
