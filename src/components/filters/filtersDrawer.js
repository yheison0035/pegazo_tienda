"use client";

import Drawer from "./drawer";
import Portal from "../ui/portal";
import FilterGroups from "./filterGroups";
import { useFilters } from "@/hooks/useFilters";

export default function FiltersDrawer({ open, onClose, filters }) {
  const { clearAll, count } = useFilters();

  if (!filters) return null;

  return (
    <Portal>
      <Drawer open={open} onClose={onClose} title="Filtrar productos">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-(--text-muted)">
            {count} filtro{count !== 1 && "s"} activo{count !== 1 && "s"}
          </span>
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

        {/* Botón fijo para volver a los resultados */}
        <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 border-t border-(--border-soft) bg-(--bg-page)/95 px-5 py-3 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-(--cta-primary) py-3 text-sm font-semibold text-(--text-inverted) transition hover:bg-(--cta-primary-hover) cursor-pointer"
          >
            Ver resultados
          </button>
        </div>
      </Drawer>
    </Portal>
  );
}
