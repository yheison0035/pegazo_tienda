"use client";

import { useCheckout } from "@/context/checkoutContext";
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import Card from "./card";

// Muestra las transportadoras disponibles con su costo y TIEMPO de entrega,
// según la ciudad/departamento del cliente. Solo aplica cuando la tienda tiene
// transportadoras configuradas y el modo de entrega necesita dirección.
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

  return (
    <Card
      title="Transportadora y tiempo de entrega"
      description="Elige cómo quieres recibir tu pedido"
    >
      {!formData.department ? (
        <p className="rounded-lg bg-(--bg-soft) px-4 py-3 text-sm text-(--text-muted)">
          Selecciona tu <b>departamento y ciudad</b> arriba para ver las
          transportadoras disponibles, su costo y el tiempo de entrega.
        </p>
      ) : shipping.loading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-(--bg-soft)"
            />
          ))}
        </div>
      ) : shipping.options.length === 0 ? (
        <p className="rounded-lg bg-(--warning)/10 px-4 py-3 text-sm text-(--text-secondary)">
          No hay transportadoras disponibles para tu destino. Contáctanos y te
          ayudamos con el envío.
        </p>
      ) : (
        <div className="space-y-2.5">
          {shipping.options.map((o) => {
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
                  className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border ${
                    active
                      ? "border-(--brand-accent) text-(--brand-accent)"
                      : "border-(--border-strong) text-transparent"
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
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-(--text-muted)">
                    {o.days && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {o.days}
                      </span>
                    )}
                    {o.cod && (
                      <span className="flex items-center gap-1 text-(--success)">
                        <BanknotesIcon className="h-3.5 w-3.5" />
                        Contra entrega
                      </span>
                    )}
                  </p>
                </div>

                <span
                  className={`flex-none text-sm font-bold ${
                    o.cost === 0 ? "text-(--success)" : "text-(--text-primary)"
                  }`}
                >
                  {money(o.cost)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
