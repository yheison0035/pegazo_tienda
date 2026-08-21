"use client";

import { useEffect, useState } from "react";
import { useWebsiteContext } from "@/context/websiteContext";
import { getBusinessType } from "@/lib/website";
import { getVertical } from "@/config/verticals";

// Devuelve la configuración de la tienda según el tipo de negocio dueño del
// dominio (terminología, presentación, entrega, layout, variantes).
//
// VISTA PREVIA: se puede forzar un vertical con ?vertical=RESTAURANTE en la URL
// (se recuerda en localStorage). Para volver al real: ?vertical=none.
export default function useVertical() {
  const { website } = useWebsiteContext();
  const baseType = getBusinessType(website);

  // Override solo en cliente para no romper la hidratación (primer render = real).
  const [override, setOverride] = useState(null);
  useEffect(() => {
    try {
      const param = new URLSearchParams(window.location.search).get("vertical");
      if (param !== null) {
        const val = param.trim().toUpperCase();
        if (!val || val === "NONE" || val === "REAL") {
          localStorage.removeItem("preview_vertical");
        } else {
          localStorage.setItem("preview_vertical", val);
        }
      }
      setOverride(localStorage.getItem("preview_vertical"));
    } catch (_) {}
  }, []);

  return getVertical(override || baseType);
}
