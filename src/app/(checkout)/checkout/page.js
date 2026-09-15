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
import { getCompanyName } from "@/lib/website";
import { shippingFor } from "@/utils/shipping";
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
    storeShipping,
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

    // Nota: NO validamos aquí si la pasarela está lista con datos del navegador
    // (pueden estar cacheados y dar un falso negativo). La verdad la tiene el
    // servidor: al pedir la firma, si la tienda no tiene pagos en línea, responde
    // con error y se muestra el mensaje amable del catch.

    setIsSubmitting(true);

    try {
      const { billingSameAsShipping } = formData;

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      // Costo de envío según lo configurado por el dueño (fallback legado).
      const { cost: shippingCost } = shippingFor(
        storeShipping,
        deliveryMethod,
        subtotal,
      );

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

      // Resumen de la compra para la pantalla de confirmación y el comprobante.
      // Vive en la sesión del navegador (sobrevive el ida y vuelta a Wompi).
      try {
        const summary = {
          code: order.orderCode,
          createdAt: new Date().toISOString(),
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          document: formData.documentNumber || "",
          address: needsAddress
            ? [
                formData.address,
                formData.neighborhood,
                formData.city,
                formData.department,
              ]
                .filter(Boolean)
                .join(", ")
            : "",
          deliveryMethod,
          paymentMethod:
            paymentMethod === "online" ? "Pago en línea" : "Contra entrega",
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            color: i.color || null,
          })),
          subtotal,
          shippingCost,
          total: subtotal + shippingCost,
          store: getCompanyName(website),
        };
        sessionStorage.setItem("pegazo_last_order", JSON.stringify(summary));
      } catch {
        /* sesión no disponible: la confirmación básica igual funciona */
      }

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
      // Los avisos útiles del backend (stock agotado, datos inválidos) se
      // muestran tal cual. Cualquier otra falla (red, 500, pasarela) recibe un
      // mensaje amable en vez de un error técnico que asuste al cliente.
      const raw = String(error?.message || "");
      const isUserFacing =
        /stock|inventario|disponib|carrito|dato|correo|teléfono|telefono|dirección|direccion|pago|línea|linea|método|metodo/i.test(
          raw,
        );
      toast.error(
        isUserFacing && raw
          ? raw
          : "Lo sentimos, tuvimos un problema interno. No es culpa tuya. Por favor inténtalo de nuevo en unos minutos.",
      );
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
