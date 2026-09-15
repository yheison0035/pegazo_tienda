"use client";

import { createContext, useContext, useEffect, useState } from "react";

const EditModeContext = createContext(null);
const TOKEN_KEY = "pegazo_edit_token";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const websiteDomain =
  process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ||
  (typeof window !== "undefined" ? window.location.hostname : "");

export function EditModeProvider({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      // 1) Token que llega en la URL (?edit=...) desde el botón del CRM.
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get("edit");
      if (fromUrl) {
        sessionStorage.setItem(TOKEN_KEY, fromUrl);
        setToken(fromUrl);
        // Limpia el parámetro de la URL sin recargar.
        params.delete("edit");
        const q = params.toString();
        window.history.replaceState(
          {},
          "",
          window.location.pathname + (q ? `?${q}` : ""),
        );
        return;
      }
      // 2) Token guardado en la sesión (login del dueño en la tienda).
      const saved = sessionStorage.getItem(TOKEN_KEY);
      if (saved) setToken(saved);
    } catch {
      /* noop */
    }
  }, []);

  const setEditToken = (t) => {
    try {
      if (t) sessionStorage.setItem(TOKEN_KEY, t);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* noop */
    }
    setToken(t || null);
  };

  const logoutEdit = () => setEditToken(null);

  // Guarda un documento legal (requiere token de edición).
  const saveLegal = async ({ slug, title, html }) => {
    const res = await fetch(`${API_URL}/website/legal`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Website-Domain": websiteDomain,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slug, title, html }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e?.message || "No se pudo guardar.");
    }
    return res.json();
  };

  return (
    <EditModeContext.Provider
      value={{ isEditing: !!token, token, setEditToken, logoutEdit, saveLegal }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext) || { isEditing: false };
}
