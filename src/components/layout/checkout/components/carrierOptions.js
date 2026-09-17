"use client";

import { useCheckout } from "@/context/checkoutContext";
import { TruckIcon, ClockIcon } from "@heroicons/react/24/outline";
import Card from "./card";

// Muestra el COSTO y el TIEMPO de entrega del envío según la ciudad del cliente.
// Como Mercado Libre / Amazon: el cliente NO elige la transportadora (eso lo
// decide la tienda al despachar); solo ve cuánto vale y en cuánto llega.
export default function CarrierOptions() {
  const { shipping, needsAddress, formData } = useCheckout();

  if (!needsAddress || shipping.mode !== "carrier") return null;

  const money = (n) => (n === 0 ? "Gratis" : `$${n.toLocaleString()}`);

  return (
    <Card title="Costo y tiempo de envío">
      {!formData.department ? (
        <p className="rounded-lg bg-(--bg-soft) px-4 py-3 text-sm text-(--text-muted)">
          Selecciona tu <b>departamento y ciudad</b> arriba para ver cuánto vale
          el envío y en cuánto llega.
        </p>
      ) : shipping.loading ? (
        <div className="h-16 animate-pulse rounded-xl bg-(--bg-soft)" />
      ) : shipping.options.length === 0 ? (
        <p className="rounded-lg bg-(--warning)/10 px-4 py-3 text-sm text-(--text-secondary)">
          Aún no tenemos envío para tu destino. Escríbenos y te ayudamos.
        </p>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-(--border-soft) bg-(--bg-soft) p-4">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-(--brand-accent)/12 text-(--brand-accent)">
            <TruckIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-(--text-primary)">
              Envío a {formData.city ? `${formData.city}, ` : ""}
              {formData.department}
            </p>
            {shipping.days && (
              <p className="flex items-center gap-1 text-xs text-(--text-muted)">
                <ClockIcon className="h-3.5 w-3.5" />
                Llega en {shipping.days}
              </p>
            )}
          </div>
          <span
            className={`flex-none text-lg font-bold ${
              shipping.cost === 0
                ? "text-(--success)"
                : "text-(--text-primary)"
            }`}
          >
            {money(shipping.cost)}
          </span>
        </div>
      )}
    </Card>
  );
}
