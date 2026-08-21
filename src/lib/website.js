export function getCompanyName(website) {
  return website?.company?.websiteName || website?.company?.name || "";
}

export function getLogo(website) {
  return website?.company?.logo || "/logo.png";
}

export function getPhone(website) {
  return website?.company?.phone || "";
}

export function getEmail(website) {
  return website?.company?.email || "";
}

export function getWhatsapp(website) {
  return website?.settings?.whatsapp || website?.company?.phone || "";
}

export function getAddress(website) {
  return website?.settings?.ecommerceLocal?.address || "";
}

export function getSchedule(website) {
  return website?.settings?.schedule || "8:00 AM - 6:00 PM";
}

export function getFacebook(website) {
  return website?.settings?.facebook || "";
}

export function getInstagram(website) {
  return website?.settings?.instagram || "";
}

export function getTikTok(website) {
  return website?.settings?.tiktok || "";
}

export function getYoutube(website) {
  return website?.settings?.youtube || "";
}

/**
 * Primera imagen utilizable de un producto, o null si no tiene ninguna.
 * Los productos llegan a veces con `image` y otras con `images` (array o
 * string), según el endpoint.
 */
export function getProductImage(product) {
  const source = product?.image ?? product?.images;

  const url = Array.isArray(source) ? source[0] : source;

  return url || null;
}

/** Descripción del negocio (la configura cada empresa en su CRM). */
export function getDescription(website) {
  const name = getCompanyName(website);

  return (
    website?.settings?.metaDescription ||
    (name ? `${name} · compra online con envíos a todo el país.` : "")
  );
}

/** Dominio público del negocio, resuelto por el backend según la petición. */
export function getSiteUrl(website) {
  if (website?.domain) return `https://${website.domain}`;

  if (typeof window !== "undefined") return window.location.origin;

  return "";
}

/** Número de WhatsApp listo para usar en un enlace wa.me (solo dígitos). */
export function getWhatsappDigits(website) {
  const raw = getWhatsapp(website).replace(/\D/g, "");

  if (!raw) return "";

  // Los números colombianos se guardan sin indicativo; wa.me lo necesita.
  return raw.length === 10 ? `57${raw}` : raw;
}

export function getFooterText(website) {
  return (
    website?.settings?.footerText ||
    "Cumplimos con la Ley 1480 de 2011 y la Ley 1581 de 2012."
  );
}

// Tipo de negocio (BusinessType de Pegazo) dueño de la tienda.
export function getBusinessType(website) {
  return website?.company?.type || null;
}
