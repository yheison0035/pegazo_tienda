"use client";

import { useEffect, useState } from "react";
import { useWebsiteContext } from "@/context/websiteContext";
import { getBusinessType } from "@/lib/website";
import { getVertical } from "@/config/verticals";

// Devuelve la configuración de la tienda según el tipo de negocio dueño del
// dominio (terminología, presentación, entrega, layout, variantes).
//
// VISTA PREVIA: se puede forzar un vertical con ?vertical=RESTAURANTE en la URL
// (lo captura VerticalPreviewCapture en el layout raíz y lo guarda). Para volver
// al real: ?vertical=none.
export default function useVertical() {
  const { website } = useWebsiteContext();
  const baseType = getBusinessType(website);

  // Override solo en cliente para no romper la hidratación (primer render = real).
  const [override, setOverride] = useState(null);
  useEffect(() => {
    const read = () => {
      try {
        setOverride(localStorage.getItem("preview_vertical"));
      } catch (_) {}
    };
    read();
    window.addEventListener("vertical-preview-change", read);
    return () => window.removeEventListener("vertical-preview-change", read);
  }, []);

  return getVertical(override || baseType);
}
