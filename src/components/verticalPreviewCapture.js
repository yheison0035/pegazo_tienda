"use client";

import { useEffect } from "react";

// Captura ?vertical=... en CUALQUIER página (va montado en el layout raíz) y lo
// guarda para la vista previa. Así funciona aunque entres por la home.
export default function VerticalPreviewCapture() {
  useEffect(() => {
    try {
      const param = new URLSearchParams(window.location.search).get("vertical");
      if (param === null) return;
      const val = param.trim().toUpperCase();
      if (!val || val === "NONE" || val === "REAL") {
        localStorage.removeItem("preview_vertical");
      } else {
        localStorage.setItem("preview_vertical", val);
      }
      window.dispatchEvent(new Event("vertical-preview-change"));
    } catch (_) {}
  }, []);

  return null;
}
