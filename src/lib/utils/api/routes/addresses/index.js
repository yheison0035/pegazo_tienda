import apiFetch from "../../auth/client";

// Direcciones guardadas del cliente (requieren sesión de cliente).

export async function getAddresses() {
  return apiFetch("/ecommerce/addresses");
}

export async function createAddress(payload) {
  return apiFetch("/ecommerce/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAddress(id, payload) {
  return apiFetch(`/ecommerce/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAddress(id) {
  return apiFetch(`/ecommerce/addresses/${id}`, { method: "DELETE" });
}
