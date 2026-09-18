"use client";

import {
  TruckIcon,
  BanknotesIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useWebsiteContext } from "@/context/websiteContext";

const COLS = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

/**
 * Franja de confianza bajo el hero. Los beneficios NO son fijos: dependen de lo
 * que el dueño configuró en el CRM (métodos de pago y envíos). Solo se deja
 * siempre "Compra protegida", que es genérico para cualquier tipo de negocio.
 */
export default function BenefitsStrip() {
  const { website } = useWebsiteContext();
  const company = website?.company;

  const shipping = company?.storeShipping || {};
  const pm = Array.isArray(company?.storePaymentMethods)
    ? company.storePaymentMethods
    : [];
  const hasPmConfig = pm.length > 0;
  const showOnline = hasPmConfig ? pm.includes("ONLINE") : true;
  const showCod = hasPmConfig ? pm.includes("COD") : true;

  const carriers = Array.isArray(shipping.carriers)
    ? shipping.carriers.filter((c) => c && c.enabled !== false)
    : [];
  const hasNational = shipping?.shipping?.enabled === true || carriers.length > 0;
  const hasLocalDelivery = shipping?.local_delivery?.enabled === true;

  const items = [];

  if (hasNational) {
    items.push({
      Icon: TruckIcon,
      title: "Envío a todo el país",
      sub: "Con transportadoras aliadas",
    });
  } else if (hasLocalDelivery) {
    items.push({
      Icon: TruckIcon,
      title: "Domicilio a tu puerta",
      sub: "Entrega en tu zona",
    });
  }

  if (showCod) {
    items.push({
      Icon: BanknotesIcon,
      title: "Pago contra entrega",
      sub: "Paga al recibir",
    });
  }

  if (showOnline) {
    items.push({
      Icon: LockClosedIcon,
      title: "Pago seguro en línea",
      sub: "Tarjeta, PSE, Nequi y más",
    });
  }

  // Genérico: aplica a cualquier tipo de negocio.
  items.push({
    Icon: ShieldCheckIcon,
    title: "Compra protegida",
    sub: "Tus datos están seguros",
  });

  if (items.length === 0) return null;

  const cols = COLS[Math.min(items.length, 4)] || "sm:grid-cols-4";

  return (
    <section className="border-y border-(--border-soft) bg-(--bg-page)">
      <div
        className={`mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-(--border-soft) sm:divide-y-0 ${cols}`}
      >
        {items.map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3 px-4 py-4 sm:justify-center">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-(--brand-primary)/10 text-(--brand-primary)">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-(--text-primary)">
                {title}
              </p>
              <p className="truncate text-xs text-(--text-muted)">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
