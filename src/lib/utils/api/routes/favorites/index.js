import apiFetch from "../../auth/client";

// Favoritos del cliente de la tienda online. Todas requieren sesión (apiFetch
// adjunta el Bearer token automáticamente).

export async function getFavorites() {
  return apiFetch("/ecommerce/favorites");
}

export async function getFavoriteIds() {
  return apiFetch("/ecommerce/favorites/ids");
}

export async function addFavorite(inventoryId) {
  return apiFetch(`/ecommerce/favorites/${inventoryId}`, { method: "POST" });
}

export async function removeFavorite(inventoryId) {
  return apiFetch(`/ecommerce/favorites/${inventoryId}`, { method: "DELETE" });
}
