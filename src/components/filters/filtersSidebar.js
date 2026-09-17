"use client";

import { useFilters } from "@/hooks/useFilters";
import FilterGroups from "./filterGroups";

export default function FiltersSidebar({ filters }) {
  const { count, clearAll } = useFilters();

  if (!filters) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-(--text-primary)">
          Filtrar por
        </h3>
        {count > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-semibold text-(--danger) hover:underline cursor-pointer"
          >
            Limpiar
          </button>
        )}
      </div>

      <FilterGroups filters={filters} />
    </div>
  );
}
