"use client";

import Link from "next/link";
import { useCart } from "@/context/cartContext";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { FaWhatsapp } from "react-icons/fa";
import { useWebsiteContext } from "@/context/websiteContext";
import { getWhatsapp } from "@/lib/website";
import useVertical from "@/hooks/useVertical";
import { shippingFor, availableDeliveryModes } from "@/utils/shipping";

export default function CartSummary({ onClose }) {
  const { items } = useCart();
  const { website } = useWebsiteContext();
  const vertical = useVertical();

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const storeShipping = website?.company?.storeShipping || null;
  const modes = availableDeliveryModes(storeShipping, vertical?.fulfillment);
  const estimateMode =
    modes.find((m) => m === "shipping" || m === "local_delivery") || modes[0];
  const { cost: shippingCost } = shippingFor(storeShipping, estimateMode, subtotal);
  const total = subtotal + shippingCost;

  // Ahorro total (suma de descuentos por precio anterior).
  const savings = items.reduce((acc, item) => {
    if (item.oldPrice && item.oldPrice > item.price) {
      return acc + (item.oldPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);

  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  // Barra de progreso "envío gratis" (si el dueño configuró un umbral).
  const freeFrom = storeShipping?.shipping?.freeFrom ?? null;
  const hasFreeShipping = freeFrom != null && freeFrom > 0;
  const reachedFree = hasFreeShipping && subtotal >= freeFrom;
  const remaining = hasFreeShipping ? Math.max(0, freeFrom - subtotal) : 0;
  const progress = hasFreeShipping
    ? Math.min(100, Math.round((subtotal / freeFrom) * 100))
    : 0;

  const whatsapp = getWhatsapp(website);
  const products = items
    .map((item) => {
      let text = `• ${item.name}\n`;
      if (item.color) text += `Color: ${item.color}\n`;
      text += `Cantidad: ${item.quantity}\n`;
      text += `Precio: $${item.price.toLocaleString()}`;
      return text;
    })
    .join("\n\n");

  const message = `🛒 *SOLICITUD DE COMPRA*

Hola, deseo realizar la siguiente compra:

${products}

━━━━━━━━━━━━━━
*Subtotal:* $${subtotal.toLocaleString()}
━━━━━━━━━━━━━━

Quedo atento para finalizar el pedido.`;

  const whatsappUrl = whatsapp
    ? `https://wa.me/57${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        message,
      )}`
    : null;

  return (
    <div className="shrink-0 border-t border-(--border-soft) bg-(--bg-page)">
      {/* Barra de envío gratis */}
      {hasFreeShipping && (
        <div className="px-4 pt-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-(--text-secondary)">
            <TruckIcon className="h-4 w-4 flex-none text-(--success)" />
            {reachedFree ? (
              <span className="font-semibold text-(--success)">
                ¡Genial! Tienes envío gratis 🎉
              </span>
            ) : (
              <span>
                Te faltan{" "}
                <strong className="text-(--text-primary)">
                  ${remaining.toLocaleString()}
                </strong>{" "}
                para el envío gratis
              </span>
            )}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--bg-muted)">
            <div
              className="h-full rounded-full bg-(--success) transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {/* Totales */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-(--text-secondary)">
            <span>
              Subtotal ({totalUnits}{" "}
              {totalUnits === 1 ? "producto" : "productos"})
            </span>
            <span className="font-medium text-(--text-primary)">
              ${subtotal.toLocaleString()}
            </span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-(--success)">Ahorras</span>
              <span className="font-medium text-(--success)">
                −${savings.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm text-(--text-secondary)">
            <span>Envío estimado</span>
            <span
              className={`font-medium ${
                shippingCost === 0
                  ? "text-(--success)"
                  : "text-(--text-primary)"
              }`}
            >
              {shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-(--border-soft) pt-2.5">
          <span className="text-base font-semibold text-(--text-primary)">
            Total
          </span>
          <span className="text-xl font-bold text-(--cta-primary)">
            ${total.toLocaleString()}
          </span>
        </div>

        {/* CTA principal */}
        <Link
          href="/checkout"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--cta-primary) py-3.5 text-base font-semibold text-(--text-inverted) shadow-sm transition hover:opacity-90"
        >
          <LockClosedIcon className="h-5 w-5" />
          Finalizar compra
        </Link>

        {/* Alternativa WhatsApp */}
        {whatsappUrl && (
          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--success) py-2.5 text-sm font-semibold text-(--success) transition hover:bg-(--success)/10"
          >
            <FaWhatsapp className="h-5 w-5" />
            Comprar por WhatsApp
          </Link>
        )}

        {/* Confianza */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-(--text-muted)">
          <ShieldCheckIcon className="h-3.5 w-3.5 flex-none" />
          <span>Compra protegida · El envío se confirma en el pago</span>
        </div>
      </div>
    </div>
  );
}
