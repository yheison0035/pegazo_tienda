"use client";

import { useState } from "react";
import { MapPinIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useCheckout } from "@/context/checkoutContext";
import PaymentMethods from "./paymentMethods";
import { Input } from "./components/input";
import Card from "./components/card";
import ShippingLocationBlock from "./components/shippingLocationBlock";
import AddressBuilder from "./components/addressBuilder";
import SavedAddresses from "./components/savedAddresses";
import CarrierOptions from "./components/carrierOptions";

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
    setFormData,
    handleChange,
    handleBlur,
    fieldError,
    isLocked,
    setIsLocked,
    paymentMethod,
    setPaymentMethod,
    isFormValid,
    deliveryMethod,
    setDeliveryMethod,
    deliveryModes,
    needsAddress,
  } = useCheckout();

  const { errors } = isFormValid();
  const err = (name) => fieldError(name, errors);
  const [addrOpen, setAddrOpen] = useState(false);

  return (
    <section className="lg:col-span-2 space-y-6">
      <Card title="Datos de contacto">
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={err("email")}
          helperText={err("email")}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Nombre"
            name="firstName"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={err("firstName")}
          />
          <Input
            label="Apellido"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={err("lastName")}
          />
          <Input
            label="Teléfono"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={err("phone")}
            helperText={err("phone")}
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
          {/* Direcciones guardadas del cliente (si inició sesión) */}
          <SavedAddresses
            selectedAddress={formData.address}
            onPick={(a) =>
              setFormData((prev) => ({
                ...prev,
                department: a.department || "",
                city: a.city || "",
                neighborhood: a.neighborhood || "",
                address: a.address || "",
                addressDetail: a.addressDetail || "",
              }))
            }
          />

          <ShippingLocationBlock
            formData={formData}
            handleChange={handleChange}
            isLocked={isLocked}
            errors={{ department: err("department"), city: err("city") }}
            required={true}
          />

          {/* Dirección: se ARMA con el asistente (evita direcciones mal escritas) */}
          <div className="mt-6">
            <label className="mb-1 block text-sm text-(--text-muted)">
              Dirección <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setAddrOpen(true)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                err("address")
                  ? "border-(--danger)"
                  : "border-(--border-soft) hover:border-(--brand-accent)"
              }`}
            >
              <MapPinIcon className="h-5 w-5 flex-none text-(--brand-accent)" />
              {formData.address ? (
                <span className="flex-1 font-medium text-(--text-primary)">
                  {formData.address}
                </span>
              ) : (
                <span className="flex-1 text-(--text-muted)">
                  Toca para armar tu dirección
                </span>
              )}
              <PencilSquareIcon className="h-5 w-5 flex-none text-(--text-muted)" />
            </button>
            {err("address") && (
              <p className="mt-1 text-xs text-(--danger)">
                {err("address")}
              </p>
            )}
          </div>

          <div className="mt-4">
            <Input
              label="Barrio"
              name="neighborhood"
              autoComplete="address-line2"
              value={formData.neighborhood}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={err("neighborhood")}
            />
          </div>

          {/* Referencias para llegar: SIEMPRE visible (ayuda al domiciliario) */}
          <div className="mt-4">
            <Input
              label="Referencias para llegar (opcional)"
              name="addressDetail"
              autoComplete="address-line3"
              value={formData.addressDetail}
              onChange={handleChange}
              placeholder="Ej: PORTÓN VERDE, CASA ESQUINERA, A 300M DEL COLEGIO"
            />
          </div>
        </Card>
      )}

      <AddressBuilder
        open={addrOpen}
        onClose={() => setAddrOpen(false)}
        onConfirm={(value) =>
          setFormData((prev) => ({ ...prev, address: value }))
        }
      />

      {/* Transportadoras + tiempos de entrega (según la ciudad) */}
      <CarrierOptions />

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
            inputMode="numeric"
            autoComplete="off"
            value={formData.documentNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={err("documentNumber")}
          />

          {!formData.billingSameAsShipping && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <Input
                label="Nombre"
                name="billingFirstName"
                value={formData.billingFirstName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={err("billingFirstName")}
              />
              <Input
                label="Apellido"
                name="billingLastName"
                value={formData.billingLastName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={err("billingLastName")}
              />
              <Input
                label="Teléfono"
                name="billingPhone"
                value={formData.billingPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={err("billingPhone")}
              />
              <Input
                label="Dirección"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={err("billingAddress")}
              />
            </div>
          )}
        </Card>
      )}

      <PaymentMethods value={paymentMethod} onChange={setPaymentMethod} />
    </section>
  );
}
