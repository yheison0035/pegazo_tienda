import apiFetch from "../../auth/client";

/**
 * Consulta pública del estado de un pedido. Seguro: exige número de pedido o guía
 * + cédula (ambos deben coincidir en el mismo pedido). No requiere sesión.
 */
export async function trackOrder({ ref, document }) {
  const query = new URLSearchParams({ ref: ref || "", document: document || "" });
  return apiFetch(`/ecommerce/order/track?${query.toString()}`, {
    auth: false,
  });
}

// Detalle completo de un pedido del cliente logueado (requiere sesión).
export async function getMyOrder(code) {
  return apiFetch(`/ecommerce/orders/${encodeURIComponent(code)}`);
}
