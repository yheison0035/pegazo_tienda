"use client";

import Link from "next/link";
import { useCart } from "@/context/cartContext";
import {
  ArrowLeftIcon,
  LockClosedIcon,
  ShieldCheckIcon,
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

  // Estimado del ENVÍO ya en el carrito (según la config del dueño). Se usa el
  // primer modo de entrega disponible (normalmente envío nacional / domicilio);
  // el valor final se confirma en el checkout según el modo que elija el cliente.
  const storeShipping = website?.company?.storeShipping || null;
  const modes = availableDeliveryModes(storeShipping, vertical?.fulfillment);
  const estimateMode =
    modes.find((m) => m === "shipping" || m === "local_delivery") || modes[0];
  const {
    cost: shippingCost,
    label: shippingLabel,
    message: shippingMessage,
  } = shippingFor(storeShipping, estimateMode, subtotal);
  const total = subtotal + shippingCost;

  // Ahorro total (suma de descuentos por precio anterior).
  const savings = items.reduce((acc, item) => {
    if (item.oldPrice && item.oldPrice > item.price) {
      return acc + (item.oldPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);

  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

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
    <div className="border-t border-(--border-soft) p-4 space-y-4">
      {/* Resumen de valores */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm text-(--text-secondary)">
          <span>
            Subtotal ({totalUnits} {totalUnits === 1 ? "producto" : "productos"})
          </span>
          <span className="font-medium text-(--text-primary)">
            ${subtotal.toLocaleString()}
          </span>
        </div>

        {savings > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-(--success)">Ahorras</span>
            <span className="font-medium text-(--success)">
              ${savings.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm text-(--text-secondary)">
          <span>Envío</span>
          <span
            className={`font-medium ${
              shippingCost === 0 ? "text-(--success)" : "text-(--text-primary)"
            }`}
          >
            {shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString()}`}
          </span>
        </div>

        {shippingMessage && shippingCost > 0 && (
          <p className="text-xs text-(--success)">{shippingMessage}</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-(--border-soft) pt-3 text-base font-semibold">
        <span className="text-(--text-primary)">Total</span>
        <span className="text-(--cta-primary)">${total.toLocaleString()}</span>
      </div>
      <p className="text-[11px] text-(--text-muted)">
        El envío se confirma en el pago según tu dirección y forma de entrega.
      </p>

      {/* Acción principal: ir al checkout con pagos en línea / contra entrega */}
      <Link
        href="/checkout"
        onClick={onClose}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--cta-primary) py-3.5 font-semibold text-(--text-inverted) transition hover:opacity-90"
      >
        <LockClosedIcon className="h-5 w-5" />
        Finalizar compra
      </Link>

      {/* Alternativa: WhatsApp (si el negocio tiene número configurado) */}
      {whatsappUrl && (
        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-(--success) py-3 font-medium text-(--success) transition hover:bg-(--success)/10"
        >
          <FaWhatsapp className="h-5 w-5" />
          Comprar por WhatsApp
        </Link>
      )}

      {/* Confianza */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-(--text-muted)">
        <ShieldCheckIcon className="h-4 w-4" />
        <span>Compra protegida. Tus datos no se comparten con terceros.</span>
      </div>

      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 text-sm text-(--text-muted) underline underline-offset-4 transition hover:text-(--brand-primary)"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Seguir comprando
        </button>
      </div>
    </div>
  );
}
