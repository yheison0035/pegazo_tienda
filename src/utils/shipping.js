// Tarifas de envío. El dueño las configura por empresa (company.storeShipping);
// si no hay config, se usa el comportamiento LEGADO (tarifas fijas) para no
// afectar las tiendas ya activas.

// ---- Legado (fallback) ----
export const FREE_SHIPPING_FROM = 100000;

export const SHIPPING_RULES = [
  { min: 20000, max: 50000, price: 18000 },
  { min: 50001, max: 99999, price: 23000 },
];

function legacyShipping(subtotal) {
  if (subtotal >= FREE_SHIPPING_FROM) {
    return { cost: 0, label: "Gratis", message: "¡Tu envío es gratis!" };
  }
  const rule = SHIPPING_RULES.find((r) => subtotal >= r.min && subtotal <= r.max);
  const cost = rule?.price || 0;
  return {
    cost,
    label: cost === 0 ? "Gratis" : `$${cost.toLocaleString()}`,
    message: `Te faltan $${(FREE_SHIPPING_FROM - subtotal).toLocaleString()} para envío gratis`,
  };
}

// Compat: algunos módulos podían importar esto (equivale al envío nacional legado).
export function calculateShipping(subtotal) {
  return legacyShipping(subtotal);
}

// Costo del envío para un método dado, según la config de la empresa.
// pickup / dine_in nunca cobran. shipping / local_delivery: tarifa fija con
// opción de "gratis desde X".
export function shippingFor(storeShipping, method, subtotal) {
  if (method === "pickup" || method === "dine_in") {
    return { cost: 0, label: "Gratis", message: "" };
  }
  const cfg = storeShipping && storeShipping[method];
  if (cfg) {
    const freeFrom = cfg.freeFrom;
    if (freeFrom != null && subtotal >= freeFrom) {
      return { cost: 0, label: "Gratis", message: "¡Tu envío es gratis!" };
    }
    const cost = Number(cfg.fee) || 0;
    const message =
      freeFrom != null && freeFrom > subtotal
        ? `Te faltan $${(freeFrom - subtotal).toLocaleString()} para envío gratis`
        : "";
    return {
      cost,
      label: cost === 0 ? "Gratis" : `$${cost.toLocaleString()}`,
      message,
    };
  }
  // Sin config por empresa: legado solo para envío nacional; el resto gratis.
  if (method === "shipping") return legacyShipping(subtotal);
  return { cost: 0, label: "Gratis", message: "" };
}

// Modos de entrega disponibles: los que el dueño activó (si configuró), en orden
// fijo; si no configuró, los del vertical (legado).
export function availableDeliveryModes(storeShipping, verticalModes) {
  if (storeShipping && typeof storeShipping === "object") {
    const order = ["shipping", "local_delivery", "pickup", "dine_in"];
    const enabled = order.filter((k) => storeShipping[k]?.enabled);
    if (enabled.length) return enabled;
  }
  return verticalModes?.length ? verticalModes : ["shipping"];
}
