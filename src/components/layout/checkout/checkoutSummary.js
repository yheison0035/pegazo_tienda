"use client";

import { useCart } from "@/context/cartContext";
import { calculateShipping } from "@/utils/shipping";
import { useCheckout } from "@/context/checkoutContext";
import useVertical from "@/hooks/useVertical";
import CheckoutCartItems from "./components/checkoutCartItems";
import { LockClosedIcon } from "@heroicons/react/24/outline";

const DELIVERY_ROW = {
  local_delivery: "Domicilio",
  pickup: "Recoger en tienda",
};

export default function CheckoutSummary() {
  const { items } = useCart();
  const { isFormValid, setShowErrors, setShowConfirm, deliveryMethod } =
    useCheckout();
  const v = useVertical();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // El envío por transportadora solo aplica a "envío a domicilio".
  const ship =
    deliveryMethod === "shipping"
      ? calculateShipping(subtotal)
      : { cost: 0, label: "Gratis", message: "" };
  const { cost, label, message } = ship;
  const total = subtotal + cost;
  const deliveryRowLabel = DELIVERY_ROW[deliveryMethod]; // undefined en dine_in

  const { valid } = isFormValid();

  function handleContinue() {
    if (!valid) {
      setShowErrors(true);
      return;
    }
    setShowConfirm(true);
  }

  return (
    <>
      <aside className="bg-(--bg-page) rounded-xl p-6 shadow-(--shadow-sm) h-fit">
        <h3 className="text-lg font-semibold mb-4">
          Resumen de tu {v.orderWord}
        </h3>

        <CheckoutCartItems />

        <div className="mt-6 space-y-2 text-sm">
          <Row label="Subtotal" value={`$${subtotal.toLocaleString()}`} />

          {deliveryMethod === "shipping" ? (
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span className="text-(--text-muted)">Envío</span>
                <span className="text-xs text-(--text-muted)">{message}</span>
              </div>
              <span
                className={`font-medium ${cost === 0 ? "text-(--success)" : ""}`}
              >
                {label}
              </span>
            </div>
          ) : deliveryRowLabel ? (
            <div className="flex justify-between">
              <span className="text-(--text-muted)">{deliveryRowLabel}</span>
              <span className="font-medium text-(--success)">Gratis</span>
            </div>
          ) : null}
        </div>

        <hr className="my-4 border-(--border-soft)" />

        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span className="text-(--cta-primary)">
            ${total.toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleContinue}
          disabled={!valid}
          className={`
            hidden lg:flex w-full mt-6
            items-center justify-center gap-2
            py-3 rounded-lg font-semibold transition cursor-pointer
            ${
              valid
                ? "bg-(--cta-primary) text-(--text-inverted) hover:opacity-90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          <LockClosedIcon className="w-5 h-5" />
          Continuar con el pago
        </button>

        <p className="mt-3 text-xs text-center text-(--text-muted)">
          🔒 Tu información está protegida y no será compartida con terceros.
        </p>
      </aside>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-(--bg-page) border-t border-(--border-soft) p-4 z-40">
        <button
          onClick={handleContinue}
          disabled={!valid}
          className={`
            w-full flex items-center justify-center gap-2
            py-3 rounded-lg font-semibold transition
            ${
              valid
                ? "bg-(--cta-primary) text-(--text-inverted)"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          <LockClosedIcon className="w-5 h-5" />
          Continuar con el pago
        </button>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-(--text-muted)">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
