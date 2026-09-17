import apiFetch from "../../auth/client";

export async function getNews() {
  return apiFetch("/ecommerce/novedades");
}

export async function getOffers() {
  return apiFetch("/ecommerce/ofertas");
}

export async function getBestSellers() {
  return apiFetch("/ecommerce/mas-vendidos");
}

export async function getRelatedProducts(slug) {
  return apiFetch(`/ecommerce/product/${slug}/related`);
}
