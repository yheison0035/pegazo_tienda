"use client";

import { useCheckout } from "@/context/checkoutContext";
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Card from "./card";

// Envío del pedido según la ciudad:
// - Si es GRATIS (supera el umbral), se muestra informativo: la tienda elige la
//   transportadora; el cliente solo ve "gratis" y el tiempo estimado.
// - Si NO es gratis, el cliente ELIGE la transportadora (cada una con su costo y
//   tiempo de entrega), como Amazon/Shopify.
export default function CarrierOptions() {
  const {
    shipping,
    selectedCarrierId,
    setSelectedCarrierId,
    needsAddress,
    formData,
  } = useCheckout();

  if (!needsAddress || shipping.mode !== "carrier") return null;

  const money = (n) => (n === 0 ? "Gratis" : `$${n.toLocaleString()}`);
  const options = shipping.options || [];
  const isFree = shipping.free;

  return (
    <Card
      title="Envío"
      description={
        !formData.department
          ? "Elige tu ciudad para ver el costo y el tiempo de entrega"
          : isFree
            ? "Tu pedido tiene envío gratis"
            : "Elige cómo quieres recibir tu pedido"
      }
    >
      {!formData.department ? (
        <p className="rounded-lg bg-(--bg-soft) px-4 py-3 text-sm text-(--text-muted)">
          Selecciona tu <b>departamento y ciudad</b> arriba para ver el envío.
        </p>
      ) : shipping.loading ? (
        <div className="space-y-2">
          <div className="h-16 animate-pulse rounded-xl bg-(--bg-soft)" />
          <div className="h-16 animate-pulse rounded-xl bg-(--bg-soft)" />
        </div>
      ) : options.length === 0 ? (
        <p className="rounded-lg bg-(--warning)/10 px-4 py-3 text-sm text-(--text-secondary)">
          Aún no tenemos envío para tu destino. Escríbenos y te ayudamos.
        </p>
      ) : isFree ? (
        // Envío gratis: informativo, sin selección (la tienda elige el operador).
        <div className="flex items-center gap-3 rounded-xl border border-(--success)/40 bg-(--success)/5 p-4">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-(--success)/15 text-(--success)">
            <TruckIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-(--success)">
              ¡Envío gratis!
            </p>
            {shipping.days && (
              <p className="flex items-center gap-1 text-xs text-(--text-muted)">
                <ClockIcon className="h-3.5 w-3.5" />
                Llega en {shipping.days}
              </p>
            )}
          </div>
          <span className="flex-none text-lg font-bold text-(--success)">
            Gratis
          </span>
        </div>
      ) : (
        // Con costo: el cliente elige la transportadora (costo/tiempo distintos).
        <div className="space-y-2.5">
          {options.map((o) => {
            const active = o.carrierId === selectedCarrierId;
            return (
              <button
                key={o.carrierId}
                type="button"
                onClick={() => setSelectedCarrierId(o.carrierId)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-(--brand-accent) bg-(--brand-accent)/5"
                    : "border-(--border-soft) hover:border-(--brand-accent)"
                }`}
              >
                <span
                  className={`flex-none ${
                    active ? "text-(--brand-accent)" : "text-(--border-strong)"
                  }`}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </span>
                {o.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={o.logo}
                    alt={o.name}
                    className="h-8 w-8 flex-none rounded-lg object-contain"
                  />
                ) : (
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-(--bg-soft) text-(--brand-accent)">
                    <TruckIcon className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-(--text-primary)">
                    {o.name}
                  </p>
                  {o.days && (
                    <p className="flex items-center gap-1 text-xs text-(--text-muted)">
                      <ClockIcon className="h-3.5 w-3.5" />
                      Llega en {o.days}
                    </p>
                  )}
                </div>
                <span className="flex-none text-sm font-bold text-(--text-primary)">
                  {money(o.cost)}
                </span>
              </button>
            );
          })}
          <p className="text-xs text-(--text-muted)">
            Elige la opción que prefieras. El costo se suma al total.
          </p>
        </div>
      )}
    </Card>
  );
}
