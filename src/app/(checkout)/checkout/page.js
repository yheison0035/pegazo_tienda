"use client";

import { useEffect } from "react";
import { useCheckout } from "@/context/checkoutContext";
import { useCustomer } from "@/context/customerContext";
import CheckoutBackLink from "@/components/layout/checkout/components/checkoutBackLink";
import CheckoutContainer from "@/components/layout/checkout/components/checkoutContainer";
import CheckoutForm from "@/components/layout/checkout/checkoutForm";
import CheckoutLoader from "@/components/layout/checkout/components/checkoutLoader";
import CheckoutSummary from "@/components/layout/checkout/checkoutSummary";
import CheckoutConfirmModal from "@/components/layout/checkout/components/checkoutConfirmModal";
import { useCart } from "@/context/cartContext";
import { useWebsiteContext } from "@/context/websiteContext";
import { calculateShipping } from "@/utils/shipping";
import { openWompiCheckout } from "@/lib/wompi/wompiCheckout";
import { createOrder } from "@/lib/utils/api/routes/checkout";
import { useToast } from "@/context/toastContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const {
    isSubmitting,
    showConfirm,
    setShowConfirm,
    setIsSubmitting,
    paymentMethod,
    formData,
    deliveryMethod,
    needsAddress,
    prefill,
  } = useCheckout();

  const { items, clearCart } = useCart();
  const { website } = useWebsiteContext();
  const company = website?.company;
  const { customer } = useCustomer();
  const toast = useToast();
  const router = useRouter();

  // Si el cliente inició sesión, rellenar sus datos en el checkout (solo campos
  // vacíos, sin pisar lo que escriba).
  useEffect(() => {
    if (!customer) return;
    const parts = String(customer.name || "").trim().split(/\s+/);
    prefill({
      email: customer.email || "",
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      phone: customer.phone || "",
      documentNumber: customer.document || "",
    });
  }, [customer, prefill]);

  async function handleConfirm() {
    setShowConfirm(false);

    const orderItems = items
      .filter((item) => item.variantId)
      .map((item) => ({
        inventoryVariantId: item.variantId,
        quantity: item.quantity,
      }));

    if (orderItems.length !== items.length) {
      // Pasa con carritos guardados antes de que se guardara la variante.
      toast.error(
        "Tu carrito está desactualizado. Vacíalo y agrega los productos de nuevo.",
      );
      return;
    }

    // Seguridad: si eligió pago en línea pero la tienda no tiene Wompi, aborta.
    if (
      paymentMethod === "online" &&
      !(company?.wompiEnabled && company?.wompiPublicKey)
    ) {
      toast.error("Esta tienda no tiene pagos en línea disponibles.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { billingSameAsShipping } = formData;

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      // El costo de envío por transportadora solo aplica a "envío a domicilio".
      // Domicilio local / recoger en tienda / mesa no lo cobran aquí.
      const { cost: shippingCalc } = calculateShipping(subtotal);
      const shippingCost = deliveryMethod === "shipping" ? shippingCalc : 0;

      const order = await createOrder({
        customer: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          documentNumber: formData.documentNumber || undefined,
          // La dirección solo se envía cuando el modo la necesita.
          department: needsAddress ? formData.department : undefined,
          city: needsAddress ? formData.city : undefined,
          address: needsAddress ? formData.address : undefined,
          addressDetail: needsAddress
            ? formData.addressDetail || undefined
            : undefined,
          neighborhood: needsAddress
            ? formData.neighborhood || undefined
            : undefined,
          isHardToAccess: needsAddress
            ? Boolean(formData.isHardToAccess)
            : false,
          billingSameAsShipping: Boolean(billingSameAsShipping),
          ...(billingSameAsShipping
            ? {}
            : {
                billingFirstName: formData.billingFirstName,
                billingLastName: formData.billingLastName,
                billingPhone: formData.billingPhone,
                billingAddress: formData.billingAddress,
              }),
        },
        items: orderItems,
        // Contra entrega se cobra en efectivo; el pago en línea es transferencia
        // y queda EN_VALIDACION hasta que Wompi confirme.
        paymentMethod: paymentMethod === "online" ? "TRANSFERENCIA" : "EFECTIVO",
        shippingCost,
        deliveryMethod,
        notes: formData.notes || undefined,
      });

      if (paymentMethod === "online") {
        // El pedido ya existe: se paga con su código como referencia.
        await openWompiCheckout({
          amount: subtotal + shippingCost,
          reference: order.orderCode,
          customerEmail: formData.email,
          publicKey: company?.wompiPublicKey,
        });

        clearCart();
        return;
      }

      clearCart();
      toast.success(`¡Pedido ${order.orderCode} confirmado!`);
      router.push(`/checkout/result?order=${order.orderCode}`);
    } catch (error) {
      toast.error(error.message || "No pudimos crear tu pedido");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <CheckoutContainer>
        <CheckoutBackLink />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24 lg:pb-0">
          <CheckoutForm />
          <CheckoutSummary />
        </div>
      </CheckoutContainer>

      {showConfirm && (
        <CheckoutConfirmModal
          paymentMethod={paymentMethod}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
        />
      )}

      {isSubmitting && <CheckoutLoader />}
    </>
  );
}
