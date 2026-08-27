import apiFetch from "../../auth/client";

// Cuenta del cliente de la tienda online. El token vive en localStorage("token")
// y apiFetch lo adjunta automáticamente en cada petición (incluido el checkout,
// para que el pedido quede a nombre del cliente logueado).

export async function registerCustomer({ name, email, password, phone, documentNumber }) {
  return apiFetch("/ecommerce/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ name, email, password, phone, documentNumber }),
  });
}

export async function loginCustomer({ email, password }) {
  return apiFetch("/ecommerce/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export async function getCustomerMe() {
  return apiFetch("/ecommerce/auth/me");
}

export async function updateCustomerMe({ name, phone, documentNumber }) {
  return apiFetch("/ecommerce/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ name, phone, documentNumber }),
  });
}

export async function googleAuthCustomer(credential) {
  return apiFetch("/ecommerce/auth/google", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ credential }),
  });
}

export async function forgotPasswordCustomer(email) {
  return apiFetch("/ecommerce/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordCustomer({ token, password }) {
  return apiFetch("/ecommerce/auth/reset-password", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ token, password }),
  });
}
