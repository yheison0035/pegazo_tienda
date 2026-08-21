"use client";

import { useWebsiteContext } from "@/context/websiteContext";
import { getBusinessType } from "@/lib/website";
import { getVertical } from "@/config/verticals";

// Devuelve la configuración de la tienda según el tipo de negocio dueño del
// dominio (terminología, presentación, entrega, layout, variantes).
export default function useVertical() {
  const { website } = useWebsiteContext();
  return getVertical(getBusinessType(website));
}
