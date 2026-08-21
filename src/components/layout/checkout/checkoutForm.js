"use client";

import { useCheckout } from "@/context/checkoutContext";
import PaymentMethods from "./paymentMethods";
import { Input } from "./components/input";
import Card from "./components/card";
import ShippingLocationBlock from "./components/shippingLocationBlock";

const MODE_LABEL = {
  shipping: "Envío a domicilio",
  local_delivery: "Domicilio",
  pickup: "Recoger en tienda",
  dine_in: "En el lugar / mesa",
};
const MODE_HINT = {
  shipping: "Te lo enviamos a tu dirección",
  local_delivery: "Te lo llevamos a domicilio",
  pickup: "Lo recoges en la tienda",
  dine_in: "Para consumir en el lugar",
};

export default function CheckoutForm() {
  const {
    formData,
    handleChange,
    isLocked,
    setIsLocked,
    paymentMethod,
    setPaymentMethod,
    showErrors,
    isFormValid,
    deliveryMethod,
    setDeliveryMethod,
    deliveryModes,
    needsAddress,
  } = useCheckout();

  const { errors } = isFormValid();

  return (
    <section className="lg:col-span-2 space-y-6">
      <Card title="Datos de contacto">
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={showErrors && errors.email}
          helperText={errors.email}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Nombre"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            error={showErrors && errors.firstName}
          />
          <Input
            label="Apellido"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            error={showErrors && errors.lastName}
          />
          <Input
            label="Teléfono"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            error={showErrors && errors.phone}
          />
        </div>
      </Card>

      {/* Selector de modo de entrega (solo si el negocio ofrece más de uno) */}
      {deliveryModes.length > 1 && (
        <Card title="¿Cómo lo quieres recibir?">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliveryModes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDeliveryMethod(m)}
                className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                  deliveryMethod === m
                    ? "border-(--cta-primary) bg-(--bg-soft)"
                    : "border-(--border-soft) hover:bg-(--bg-soft)"
                }`}
              >
                <span className="block text-sm font-semibold text-(--text-primary)">
                  {MODE_LABEL[m] || m}
                </span>
                <span className="block text-xs text-(--text-muted)">
                  {MODE_HINT[m] || ""}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Dirección: solo cuando el modo la necesita (envío / domicilio) */}
      {needsAddress && (
        <Card
          title="Dirección de entrega"
          description="Usaremos esta información para coordinar la entrega"
          action={
            isLocked && (
              <button
                onClick={() => setIsLocked(false)}
                className="text-sm text-(--brand-accent) font-medium hover:underline"
              >
                Cambiar ciudad
              </button>
            )
          }
        >
          <ShippingLocationBlock
            formData={formData}
            handleChange={handleChange}
            isLocked={isLocked}
            errors={showErrors ? errors : {}}
            required={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Input
              label="Dirección"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Ej: Calle 45 #12-34"
              error={showErrors && errors.address}
            />
            <Input
              label="Barrio"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              required
              error={showErrors && errors.neighborhood}
            />
          </div>

          <div className="mt-6 rounded-xl border border-(--border-soft) bg-(--bg-soft) p-4 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="isHardToAccess"
                checked={formData.isHardToAccess}
                onChange={handleChange}
                className="mt-1 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-(--text-primary)">
                  Dirección de difícil acceso
                </span>
                <span className="text-xs text-(--text-muted)">
                  Zona rural, finca, vereda o sin nomenclatura
                </span>
              </div>
            </div>

            {formData.isHardToAccess && (
              <div className="pt-3 border-t border-(--border-soft)">
                <Input
                  label="Referencias para llegar"
                  name="addressDetail"
                  value={formData.addressDetail}
                  onChange={handleChange}
                  placeholder="Ej: portón verde, a 300m del colegio"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Instrucciones / mesa: para recoger en tienda o consumo en el lugar */}
      {!needsAddress && (
        <Card
          title={
            deliveryMethod === "dine_in"
              ? "Mesa e instrucciones"
              : "Instrucciones para recoger"
          }
        >
          <Input
            label={
              deliveryMethod === "dine_in"
                ? "Nº de mesa o instrucciones (opcional)"
                : "Instrucciones (opcional)"
            }
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder={
              deliveryMethod === "dine_in"
                ? "Ej: Mesa 5"
                : "Ej: paso por él a las 3 pm"
            }
          />
        </Card>
      )}

      {/* Facturación: solo con dirección (envío/domicilio) */}
      {needsAddress && (
        <Card title="Datos de facturación">
          <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer hover:underline">
            <input
              type="checkbox"
              name="billingSameAsShipping"
              checked={formData.billingSameAsShipping}
              onChange={handleChange}
              className="cursor-pointer"
            />
            Mis datos de facturación son los mismos del envío
          </label>

          <Input
            label="Documento (CC / NIT / CE)"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleChange}
            required
            error={showErrors && errors.documentNumber}
          />

          {!formData.billingSameAsShipping && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <Input
                label="Nombre"
                name="billingFirstName"
                value={formData.billingFirstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido"
                name="billingLastName"
                value={formData.billingLastName}
                onChange={handleChange}
                required
              />
              <Input
                label="Teléfono"
                name="billingPhone"
                value={formData.billingPhone}
                onChange={handleChange}
                required
              />
              <Input
                label="Dirección"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleChange}
                required
              />
            </div>
          )}
        </Card>
      )}

      <PaymentMethods value={paymentMethod} onChange={setPaymentMethod} />
    </section>
  );
}
