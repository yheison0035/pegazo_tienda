"use client";

import { useSearchParams } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useFilters } from "@/hooks/useFilters";

const cop = (n) => "$" + Number(n || 0).toLocaleString("es-CO");

/**
 * Barra de filtros aplicados (chips removibles) al estilo Mercado Libre.
 * Se muestra arriba de la grilla, en todos los tamaños de pantalla.
 */
export default function ActiveFilters({ filters }) {
  const sp = useSearchParams();
  const { toggle, set, setMany, clearAll, count } = useFilters();

  if (count === 0) return null;

  const chips = [];

  const av = sp.get("availability");
  if (av === "in")
    chips.push({ key: "av", label: "Disponibles", remove: () => set("availability", "") });
  if (av === "out")
    chips.push({ key: "av", label: "Agotados", remove: () => set("availability", "") });

  (sp.get("brands") || "")
    .split(",")
    .filter(Boolean)
    .forEach((v) => {
      const opt = filters?.brands?.find((b) => b.value === v);
      chips.push({ key: "b" + v, label: opt?.label || v, remove: () => toggle("brands", v) });
    });

  (sp.get("colors") || "")
    .split(",")
    .filter(Boolean)
    .forEach((v) => {
      const opt = filters?.colors?.find((c) => c.value === v);
      chips.push({ key: "c" + v, label: opt?.label || v, remove: () => toggle("colors", v) });
    });

  const mn = sp.get("minPrice");
  const mx = sp.get("maxPrice");
  if (mn || mx) {
    const label =
      mn && mx ? `${cop(mn)} – ${cop(mx)}` : mn ? `Desde ${cop(mn)}` : `Hasta ${cop(mx)}`;
    chips.push({ key: "price", label, remove: () => setMany({ minPrice: "", maxPrice: "" }) });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 md:px-0">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.remove}
          className="group inline-flex items-center gap-1 rounded-full border border-(--border-soft) bg-(--bg-soft) py-1 pl-3 pr-2 text-sm text-(--text-secondary) transition hover:border-(--border-strong) cursor-pointer"
        >
          <span className="max-w-40 truncate">{c.label}</span>
          <XMarkIcon className="h-4 w-4 flex-none text-(--text-muted) transition group-hover:text-(--danger)" />
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-sm font-semibold text-(--danger) hover:underline cursor-pointer"
      >
        Limpiar todo
      </button>
    </div>
  );
}
