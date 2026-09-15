"use client";

import { mapSearchProduct } from "@/utils/mapSearchProduct";
import SearchItem from "./searchItem";

export default function SearchResults({ results }) {
  const shown = results.slice(0, 8);
  const more = results.length - shown.length;

  return (
    <div className="absolute top-full z-999 mt-2 w-full overflow-hidden rounded-2xl border border-(--border-soft) bg-(--bg-page) shadow-(--shadow-lg)">
      <div className="flex items-center justify-between border-b border-(--border-soft) bg-(--bg-soft) px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
          Productos
        </span>
        <span className="rounded-full bg-(--bg-page) px-2 py-0.5 text-xs font-medium text-(--text-secondary)">
          {results.length}{" "}
          {results.length === 1 ? "resultado" : "resultados"}
        </span>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        {shown.map((product) => (
          <SearchItem key={product.id} product={mapSearchProduct(product)} />
        ))}
      </div>

      {more > 0 && (
        <div className="border-t border-(--border-soft) bg-(--bg-soft) px-4 py-2.5 text-center text-xs text-(--text-muted)">
          Escribe más para afinar tu búsqueda ({more} más)
        </div>
      )}
    </div>
  );
}
