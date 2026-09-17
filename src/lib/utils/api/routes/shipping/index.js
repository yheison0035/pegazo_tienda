import apiFetch from "../../auth/client";

// Cotiza el envío según el destino (departamento) y el subtotal. Devuelve las
// opciones de transportadora con costo y tiempo de entrega. Público (no requiere
// sesión); el backend es la fuente de verdad del costo.
export async function quoteShipping({ department, city, subtotal, carrierId }) {
  return apiFetch("/ecommerce/shipping/quote", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ department, city, subtotal, carrierId }),
  });
}
