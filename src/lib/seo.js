/**
 * Datos estructurados (JSON-LD) de la tienda.
 *
 * Todo sale de la empresa dueña del dominio: no hay ningún dato fijo. Se
 * generan en el servidor para que los buscadores los vean en el HTML sin
 * tener que ejecutar JavaScript.
 */

const COUNTRY = "CO";
const CURRENCY = "COP";

// SEO por tipo de negocio (vertical): tipo de schema.org, una descripción
// orientada al negocio y palabras clave. Todo se genera dinámicamente según el
// `company.type`, para que la tienda de cualquier vertical quede bien posicionada
// sin que el dueño configure nada. Si el tipo no está aquí, cae al genérico.
const VERTICAL_SEO = {
  RESTAURANTE: { schemaType: "Restaurant", label: "Restaurante", desc: (n) => `Pide a domicilio en ${n}: nuestro menú, promociones y entrega rápida.`, keywords: ["restaurante", "domicilios", "comida a domicilio", "menú", "pedir comida"] },
  COMIDA_RAPIDA: { schemaType: "FastFoodRestaurant", label: "Comidas rápidas", desc: (n) => `Pide comidas rápidas a domicilio en ${n}: hamburguesas, perros y más.`, keywords: ["comidas rápidas", "domicilios", "hamburguesas", "perros calientes", "pedir comida"] },
  CAFETERIA: { schemaType: "CafeOrCoffeeShop", label: "Cafetería", desc: (n) => `Café, postres y desayunos en ${n}. Pide a domicilio o recoge en tienda.`, keywords: ["cafetería", "café", "postres", "desayunos", "domicilios"] },
  SERVICIOS: { schemaType: "HealthAndBeautyBusiness", label: "Barbería y belleza", desc: (n) => `Agenda tu cita en ${n}: servicios de barbería y belleza, y productos.`, keywords: ["barbería", "peluquería", "belleza", "agendar cita", "productos de cuidado"] },
  ODONTOLOGIA: { schemaType: "Dentist", label: "Odontología", desc: (n) => `Agenda tu cita odontológica en ${n}. Servicios de salud oral.`, keywords: ["odontología", "dentista", "salud oral", "cita odontológica"] },
  DROGUERIA: { schemaType: "Pharmacy", label: "Droguería", desc: (n) => `Compra medicamentos y productos de salud en ${n} con entrega a domicilio.`, keywords: ["droguería", "farmacia", "medicamentos", "salud", "domicilios"] },
  SUPERMERCADO: { schemaType: "GroceryStore", label: "Supermercado", desc: (n) => `Haz tu mercado en ${n} con entrega a domicilio. Precios y productos frescos.`, keywords: ["supermercado", "mercado", "domicilios", "abarrotes", "canasta familiar"] },
  FRUVER: { schemaType: "GroceryStore", label: "Fruver", desc: (n) => `Frutas y verduras frescas en ${n} con entrega a domicilio.`, keywords: ["fruver", "frutas", "verduras", "domicilios", "frescos"] },
  CARNICERIA: { schemaType: "GroceryStore", label: "Carnicería", desc: (n) => `Carnes frescas en ${n} con entrega a domicilio.`, keywords: ["carnicería", "carnes", "domicilios", "res", "cerdo", "pollo"] },
  ROPA: { schemaType: "ClothingStore", label: "Moda y ropa", desc: (n) => `Ropa y moda en ${n}. Compra online con envíos a todo el país.`, keywords: ["ropa", "moda", "tienda de ropa", "comprar ropa online"] },
  CALZADO: { schemaType: "ShoeStore", label: "Calzado", desc: (n) => `Calzado para toda la familia en ${n}. Compra online con envíos.`, keywords: ["calzado", "zapatos", "tenis", "tienda de calzado", "comprar zapatos"] },
  FLORISTERIA: { schemaType: "Florist", label: "Floristería", desc: (n) => `Flores y arreglos en ${n} con entrega a domicilio.`, keywords: ["floristería", "flores", "arreglos florales", "domicilios", "ramos"] },
  LAVADO_VEHICULOS: { schemaType: "AutoWash", label: "Lavado de vehículos", desc: (n) => `Agenda el lavado de tu vehículo en ${n}.`, keywords: ["lavado de autos", "lavado de vehículos", "autolavado", "agendar"] },
  TELEVENTAS: { schemaType: "Store", label: "Tienda online", desc: (n) => `Compra online en ${n} con envíos a todo el país y pago seguro.`, keywords: ["tienda online", "comprar online", "envíos", "ofertas"] },
  ECOMMERCE: { schemaType: "OnlineStore", label: "Tienda online", desc: (n) => `Compra online en ${n} con envíos a todo el país y pago seguro.`, keywords: ["tienda online", "ecommerce", "comprar online", "envíos"] },
};

function verticalSeo(website) {
  const type = (website?.company?.type || "").toUpperCase();
  return VERTICAL_SEO[type] || null;
}

function clean(object) {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );
}

export function siteName(website) {
  return (
    website?.company?.websiteName || website?.company?.name || "Tienda online"
  );
}

// Título por defecto para buscadores: si el dueño puso uno propio se respeta;
// si no, se arma dinámico con el nombre + la vertical ("RAGNOR · Barbería").
export function siteTitle(website) {
  const custom = website?.settings?.metaTitle;
  if (custom) return custom;
  const name = siteName(website);
  const v = verticalSeo(website);
  return v?.label ? `${name} · ${v.label}` : name;
}

export function siteDescription(website) {
  if (website?.settings?.metaDescription) return website.settings.metaDescription;
  const v = verticalSeo(website);
  if (v?.desc) return v.desc(siteName(website));
  return `Compra online en ${siteName(website)} con envíos a todo el país.`;
}

// Palabras clave por vertical + el nombre del negocio.
export function siteKeywords(website) {
  const v = verticalSeo(website);
  const base = v?.keywords ? [...v.keywords] : ["tienda online", "comprar online"];
  const name = siteName(website);
  if (name) base.push(name);
  return base;
}

// Tipo de negocio en schema.org según la vertical (default: Store).
export function storeSchemaType(website) {
  return verticalSeo(website)?.schemaType || "Store";
}

/** Redes sociales configuradas, para `sameAs`. */
function socialProfiles(website) {
  const settings = website?.settings || {};

  return [
    settings.instagram,
    settings.facebook,
    settings.tiktok,
    settings.youtube,
  ].filter(Boolean);
}

/** Teléfono en formato internacional para los datos estructurados. */
function contactPhone(website) {
  const raw = (
    website?.settings?.whatsapp ||
    website?.company?.phone ||
    ""
  ).replace(/\D/g, "");

  if (!raw) return "";

  return raw.length === 10 ? `+57${raw}` : `+${raw}`;
}

/** La tienda como negocio: nombre, logo, contacto, dirección y redes. */
export function buildStoreSchema(website, siteUrl) {
  if (!website?.company) return null;

  const company = website.company;
  const local = website?.settings?.ecommerceLocal;
  const phone = contactPhone(website);

  const address = local
    ? clean({
        "@type": "PostalAddress",
        streetAddress: website?.settings?.address || local.address,
        addressLocality: local.city,
        addressRegion: local.department,
        addressCountry: COUNTRY,
      })
    : null;

  return clean({
    "@context": "https://schema.org",
    "@type": storeSchemaType(website),
    "@id": `${siteUrl}/#store`,
    name: siteName(website),
    legalName: company.name,
    description: siteDescription(website),
    url: siteUrl,
    logo: company.logo,
    image: company.logo,
    email: company.email,
    telephone: phone,
    address,
    currenciesAccepted: CURRENCY,
    areaServed: COUNTRY,
    sameAs: socialProfiles(website),
    contactPoint: phone
      ? {
          "@type": "ContactPoint",
          telephone: phone,
          contactType: "customer service",
          areaServed: COUNTRY,
          availableLanguage: ["Spanish"],
        }
      : undefined,
  });
}

/** El sitio en sí, con la caja de búsqueda que Google puede mostrar. */
export function buildWebSiteSchema(website, siteUrl) {
  if (!website?.company) return null;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName(website),
    description: siteDescription(website),
    url: siteUrl,
    inLanguage: "es-CO",
    publisher: { "@id": `${siteUrl}/#store` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/?buscar={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbSchema(siteUrl, trail = []) {
  if (trail.length === 0) return null;

  const items = [{ name: "Inicio", url: siteUrl }, ...trail];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildProductSchema({ product, category, website, siteUrl }) {
  if (!product) return null;

  const url = `${siteUrl}/${category}/${product.slug}`;

  // La ficha no trae un stock total: se suma el de las variantes.
  const stock =
    product.stock ??
    product.colors?.reduce((total, color) => total + (color.stock || 0), 0);

  const inStock = stock === undefined || stock > 0;

  // Google pide una fecha de validez del precio; un año es lo habitual.
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

  return clean({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description,
    image: product.images,
    sku: String(product.id),
    url,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    offers: clean({
      "@type": "Offer",
      url,
      priceCurrency: CURRENCY,
      price: product.price,
      priceValidUntil: priceValidUntil.toISOString().slice(0, 10),
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": `${siteUrl}/#store` },
    }),
  });
}

/** Listado de productos de una categoría, para que Google entienda la página. */
export function buildItemListSchema({ products, category, siteUrl, name }) {
  if (!products?.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/${category}/${product.slug}`,
      name: product.name,
    })),
  };
}

/** Convierte un slug de URL en un nombre legible ("belleza-mujer" → "Belleza Mujer"). */
export function humanize(slug) {
  return (slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
