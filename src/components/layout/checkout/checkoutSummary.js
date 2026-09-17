"use client";

import { useCheckout } from "@/context/checkoutContext";
import useVertical from "@/hooks/useVertical";
import CheckoutCartItems from "./components/checkoutCartItems";
import { LockClosedIcon, ClockIcon } from "@heroicons/react/24/outline";

const DELIVERY_ROW = {
  local_delivery: "Domicilio",
  pickup: "Recoger en tienda",
};

// Nombres amables para decirle al cliente QUÉ le falta por completar.
const FIELD_LABELS = {
  email: "Correo electrónico",
  firstName: "Nombre",
  lastName: "Apellido",
  phone: "Teléfono",
  department: "Departamento",
  city: "Ciudad",
  address: "Dirección",
  neighborhood: "Barrio",
  documentNumber: "Documento",
  paymentMethod: "Método de pago",
  billingFirstName: "Nombre de facturación",
  billingLastName: "Apellido de facturación",
  billingPhone: "Teléfono de facturación",
  billingAddress: "Dirección de facturación",
};

export default function CheckoutSummary() {
  const {
    isFormValid,
    setShowErrors,
    setShowConfirm,
    deliveryMethod,
    needsAddress,
    subtotal,
    shipping,
  } = useCheckout();
  const v = useVertical();

  const cost = shipping.cost;
  const label = shipping.label;
  const message = shipping.message;
  const days = shipping.days;
  const total = subtotal + cost;
  // Domicilio a domicilio (shipping/local_delivery) muestra su costo; los demás
  // (pickup/dine_in) muestran su etiqueta sin cobro.
  const chargesShipping =
    deliveryMethod === "shipping" || deliveryMethod === "local_delivery";
  const deliveryRowLabel = DELIVERY_ROW[deliveryMethod]; // undefined en dine_in

  const { valid, errors } = isFormValid();

  // Lista de campos que faltan por completar (para guiar al cliente). addressDetail
  // es opcional salvo difícil acceso, así que no bloquea.
  const missing = Object.keys(errors)
    .filter((k) => k !== "addressDetail" && FIELD_LABELS[k])
    .map((k) => FIELD_LABELS[k]);

  // Con transportadoras, no continuar hasta tener el envío cotizado por ciudad.
  const shippingPending =
    needsAddress && shipping.mode === "carrier" && !shipping.ready;

  function handleContinue() {
    if (!valid) {
      setShowErrors(true);
      // Lleva la vista al primer campo con error.
      if (typeof document !== "undefined") {
        const el = document.querySelector("[data-error='true']");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (shippingPending) return;
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

          {chargesShipping ? (
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span className="text-(--text-muted)">
                  {deliveryMethod === "local_delivery" ? "Domicilio" : "Envío"}
                </span>
                {days && (
                  <span className="flex items-center gap-1 text-xs text-(--text-muted)">
                    <ClockIcon className="h-3.5 w-3.5" />
                    Entrega: {days}
                  </span>
                )}
                {message && (
                  <span className="text-xs text-(--text-muted)">{message}</span>
                )}
              </div>
              <span
                className={`font-medium ${cost === 0 ? "text-(--success)" : ""}`}
              >
                {shipping.loading ? "Calculando…" : label}
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

        {/* Guía: qué falta por completar (siempre visible si hay pendientes) */}
        {!valid && missing.length > 0 && (
          <div className="mt-4 rounded-lg border border-(--warning) bg-(--warning)/10 p-3 text-xs text-(--text-secondary)">
            <p className="mb-1 font-semibold text-(--text-primary)">
              Para continuar completa:
            </p>
            <ul className="list-disc space-y-0.5 pl-4">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={shippingPending}
          className="hidden lg:flex w-full mt-4 items-center justify-center gap-2 py-3 rounded-lg font-semibold transition cursor-pointer bg-(--cta-primary) text-(--text-inverted) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LockClosedIcon className="w-5 h-5" />
          {shippingPending ? "Calculando envío…" : "Continuar con el pago"}
        </button>

        <p className="mt-3 text-xs text-center text-(--text-muted)">
          🔒 Tu información está protegida y no será compartida con terceros.
        </p>
      </aside>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-(--bg-page) border-t border-(--border-soft) p-4 z-40">
        {!valid && missing.length > 0 && (
          <p className="mb-2 text-center text-xs text-(--text-muted)">
            Falta completar: {missing.join(", ")}
          </p>
        )}
        <button
          onClick={handleContinue}
          disabled={shippingPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition bg-(--cta-primary) text-(--text-inverted) disabled:opacity-60"
        >
          <LockClosedIcon className="w-5 h-5" />
          {shippingPending ? "Calculando envío…" : "Continuar con el pago"}
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
