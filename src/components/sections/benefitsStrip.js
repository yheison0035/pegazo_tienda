"use client";

import {
  TruckIcon,
  BanknotesIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const ITEMS = [
  { Icon: TruckIcon, title: "Envío a todo el país", sub: "Recíbelo en tu ciudad" },
  { Icon: BanknotesIcon, title: "Pago contra entrega", sub: "Paga al recibir" },
  { Icon: LockClosedIcon, title: "Pago seguro en línea", sub: "Tarjeta, PSE y más" },
  { Icon: ShieldCheckIcon, title: "Compra protegida", sub: "Garantía y soporte" },
];

/**
 * Franja de confianza bajo el hero (estilo Mercado Libre / Amazon).
 * Full-width, responsive (2 col en móvil, 4 en desktop) y por tokens del tema.
 */
export default function BenefitsStrip() {
  return (
    <section className="border-y border-(--border-soft) bg-(--bg-page)">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-(--border-soft) sm:grid-cols-4 sm:divide-y-0">
        {ITEMS.map(({ Icon, title, sub }) => (
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
