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

  const base = getVertical(override || baseType);

  // En vista previa (override) se respeta el vertical previsualizado tal cual,
  // sin mezclar la configuración real del negocio.
  if (override) return base;

  // Ajustes configurados por la plataforma para este tipo. Mandan sobre el mapa
  // por defecto: presentación/entrega (typeStorefront) y vocabulario
  // (typeTerminology, el mismo que ve el CRM).
  const ts = website?.company?.typeStorefront;
  const term = website?.company?.typeTerminology;
  const merged = { ...base };

  if (ts && typeof ts === "object") {
    if (Array.isArray(ts.fulfillment) && ts.fulfillment.length)
      merged.fulfillment = ts.fulfillment;
    if (ts.layout) merged.layout = ts.layout;
    if (ts.variant) merged.variant = ts.variant;
    if (typeof ts.showSpecs === "boolean") merged.showSpecs = ts.showSpecs;
    if (typeof ts.warrantyBadge === "boolean")
      merged.warrantyBadge = ts.warrantyBadge;
  }

  if (term && typeof term === "object") {
    if (term.product) merged.productWord = term.product;
    if (term.productPlural) merged.productPlural = term.productPlural;
    if (term.catalogLabel) merged.catalogLabel = term.catalogLabel;
    if (term.sale) {
      merged.orderWordCap = term.sale;
      merged.orderWord = String(term.sale).toLowerCase();
    }
  }

  return merged;
}
