"use client";

import { useState } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  MapPinIcon,
  HomeIcon,
  ExclamationTriangleIcon,
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
  const [ref, setRef] = useState("");
  const [document, setDocument] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const close = () => {
    setOpen(false);
    // Limpia al cerrar para no dejar datos de un pedido en pantalla.
    setTimeout(() => {
      setResult(null);
      setError("");
      setRef("");
      setDocument("");
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
      const res = await trackOrder({ ref: ref.trim(), document: document.trim() });
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Consultar mi pedido"
        title="Consultar mi pedido"
        className="group flex items-center gap-2 rounded-full px-2 py-1.5 text-(--text-primary) transition hover:bg-(--bg-soft) hover:text-(--brand-accent)"
      >
        <TruckIcon className="h-6 w-6 transition group-hover:-translate-x-0.5" />
        <span className="hidden text-sm font-medium lg:inline">Mi pedido</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="to-pop relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-(--bg-page) shadow-2xl sm:rounded-2xl">
            {/* Cabecera con banda animada */}
            <div className="relative overflow-hidden bg-(--brand-primary) px-6 py-5 text-(--text-inverted)">
              <div className="to-road pointer-events-none absolute inset-x-0 bottom-0 h-1 opacity-70" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TruckIcon className="to-truck h-6 w-6" />
                  <h2 className="text-lg font-bold">Consultar mi pedido</h2>
                </div>
                <button
                  onClick={close}
                  aria-label="Cerrar"
                  className="rounded-full p-1 transition hover:bg-white/15"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <p className="mt-1 text-sm opacity-90">
                Sigue tu pedido en tiempo real.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!result ? (
                <form onSubmit={submit} className="space-y-4">
                  <p className="text-sm text-(--text-secondary)">
                    Por tu seguridad pedimos <b>dos datos</b>: el número de tu
                    pedido o guía, y tu cédula.
                  </p>

                  <div>
                    <label className="mb-1 block text-sm text-(--text-muted)">
                      Número de pedido o guía
                    </label>
                    <input
                      value={ref}
                      onChange={(e) => setRef(e.target.value)}
                      placeholder="Ej: EUR-1699999999 o guía"
                      className="w-full rounded-lg border border-(--border-soft) px-4 py-2.5 outline-none transition focus:ring-2 focus:ring-(--brand-accent)"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-(--text-muted)">
                      Número de cédula
                    </label>
                    <input
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      inputMode="numeric"
                      placeholder="Tu documento"
                      className="w-full rounded-lg border border-(--border-soft) px-4 py-2.5 outline-none transition focus:ring-2 focus:ring-(--brand-accent)"
                    />
                  </div>

                  {error && (
                    <p className="rounded-lg bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--cta-primary) py-3 font-semibold text-(--text-inverted) transition hover:opacity-90 disabled:opacity-60"
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
                        setResult(null);
                        setError("");
                      }}
                      className="text-sm font-medium text-(--brand-accent) hover:underline"
                    >
                      Otra consulta
                    </button>
                  </div>

                  {/* Estado especial (no entregado / devuelto) */}
                  {special ? (
                    <div className="flex items-start gap-3 rounded-xl border border-(--warning) bg-(--warning)/10 p-4">
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
                    <div>
                      <div className="relative mx-1 mb-4 mt-2 h-1.5 rounded-full bg-(--bg-muted)">
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

                  {/* Datos de envío */}
                  {(result.carrier || result.trackingNumber) && (
                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-(--border-soft) p-4 text-sm">
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
                  <div className="rounded-xl border border-(--border-soft) p-4">
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
                    <div className="mt-3 flex justify-between border-t border-(--border-soft) pt-3 font-semibold">
                      <span>Total</span>
                      <span className="text-(--cta-primary)">
                        {money(result.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toPop { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
        .to-pop { animation: toPop .28s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes toFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .to-fade { animation: toFade .35s ease both; }
        @keyframes toTruck { 0%,100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
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
          .to-pop,.to-fade,.to-truck,.to-road,.to-fill,.to-pulse,.to-spin { animation: none; }
        }
      `}</style>
    </>
  );
}
