// Adaptación del storefront según el tipo de negocio (BusinessType de Pegazo).
// Una sola tienda desplegada sirve a muchas empresas; según su `company.type`
// cambian el vocabulario, la presentación y (en fases siguientes) el checkout,
// el layout y el modelo de variantes.
//
// Los negocios de SERVICIOS no usan tienda (usan el booking de Pegazo), por eso
// no se incluyen aquí.

const DEFAULT = {
  // --- Terminología ---
  productWord: "Producto",
  productPlural: "Productos",
  orderWord: "pedido", // "tu pedido", "resumen de tu pedido"
  orderWordCap: "Pedido",
  addToCart: "Añadir al carrito",
  buyNow: "Comprar ahora",
  catalogLabel: "Productos",

  // --- Presentación (Fase 1) ---
  showSpecs: true, // tabla de "Especificaciones técnicas" + "Características"
  warrantyBadge: true, // insignia "Garantía incluida"

  // --- Layout (Fase 3) ---
  layout: "grid", // grid | menu

  // --- Modelo de variantes (Fase 4) ---
  variant: "color", // color | size | weight | modifiers | none

  // --- Entrega / checkout (Fase 2) ---
  // shipping = envío nacional por transportadora
  // local_delivery = domicilio local (tarifa/zona propia)
  // pickup = recoger en tienda
  // dine_in = consumo en el lugar (mesa)
  fulfillment: ["shipping"],
};

const BY_TYPE = {
  // ---- Canales de venta de producto físico (comportamiento por defecto) ----
  TELEVENTAS: {},
  ECOMMERCE: {},
  DISTRIBUCION: {},
  ZORVEX: {},
  FERIA: {},

  // ---- Comida ----
  RESTAURANTE: {
    productWord: "Plato",
    productPlural: "Platos",
    orderWord: "orden",
    orderWordCap: "Orden",
    addToCart: "Agregar",
    buyNow: "Ordenar ahora",
    catalogLabel: "Menú",
    showSpecs: false,
    warrantyBadge: false,
    layout: "menu",
    variant: "modifiers",
    fulfillment: ["dine_in", "pickup", "local_delivery"],
  },
  COMIDA_RAPIDA: {
    orderWord: "orden",
    orderWordCap: "Orden",
    addToCart: "Agregar",
    buyNow: "Ordenar ahora",
    catalogLabel: "Menú",
    showSpecs: false,
    warrantyBadge: false,
    layout: "menu",
    variant: "modifiers",
    fulfillment: ["pickup", "local_delivery"],
  },
  CAFETERIA: {
    orderWord: "orden",
    orderWordCap: "Orden",
    addToCart: "Agregar",
    catalogLabel: "Menú",
    showSpecs: false,
    warrantyBadge: false,
    layout: "menu",
    fulfillment: ["pickup", "local_delivery"],
  },

  // ---- Retail / alimentos ----
  SUPERMERCADO: {
    showSpecs: false,
    warrantyBadge: false,
    variant: "weight",
    fulfillment: ["shipping", "pickup", "local_delivery"],
  },
  FRUVER: {
    showSpecs: false,
    warrantyBadge: false,
    variant: "weight",
    fulfillment: ["pickup", "local_delivery"],
  },
  CARNICERIA: {
    productWord: "Corte",
    productPlural: "Cortes",
    showSpecs: false,
    warrantyBadge: false,
    variant: "weight",
    fulfillment: ["pickup", "local_delivery"],
  },
  ROPA: {
    productWord: "Prenda",
    productPlural: "Prendas",
    showSpecs: false,
    variant: "size",
    fulfillment: ["shipping", "pickup"],
  },
  DROGUERIA: {
    productWord: "Medicamento",
    productPlural: "Medicamentos",
    showSpecs: false,
    warrantyBadge: false,
    fulfillment: ["shipping", "pickup", "local_delivery"],
  },
  FLORISTERIA: {
    productWord: "Arreglo",
    productPlural: "Arreglos",
    showSpecs: false,
    warrantyBadge: false,
    fulfillment: ["local_delivery", "pickup"],
  },
};

export function getVertical(type) {
  return { ...DEFAULT, ...(BY_TYPE[type] || {}) };
}
