"use client";

import Drawer from "./drawer";
import Portal from "../ui/portal";
import { useFilters } from "@/hooks/useFilters";

export default function FiltersDrawer({ open, onClose, filters }) {
  const { toggle, has, set, clearAll, count, get } = useFilters();

  if (!filters) return null;

  return (
    <Portal>
      <Drawer open={open} onClose={onClose} title="Filtrar productos">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-(--text-muted)">
            {count} filtro{count !== 1 && "s"} activo
            {count !== 1 && "s"}
          </span>

          {count > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-(--danger) hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>

        <Section title="Disponibilidad">
          {[
            ["", "Todos"],
            ["in", "Disponibles"],
            ["out", "Agotados"],
          ].map(([val, label]) => (
            <label
              key={val || "all"}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="radio"
                name="availability-mobile"
                checked={(get("availability") || "") === val}
                onChange={() => set("availability", val)}
                className="accent-(--brand-primary)"
              />
              {label}
            </label>
          ))}
        </Section>

        {filters.brands?.length > 0 && (
          <Section title="Marca">
            {filters.brands.map((b) => (
              <Check
                key={b.value}
                label={`${b.label} (${b.count})`}
                checked={has("brands", b.value)}
                onChange={() => toggle("brands", b.value)}
              />
            ))}
          </Section>
        )}

        {filters.colors?.length > 0 && (
          <Section title="Color">
            {filters.colors.map((c) => (
              <Check
                key={c.value}
                label={`${c.label} (${c.count})`}
                checked={has("colors", c.value)}
                onChange={() => toggle("colors", c.value)}
              />
            ))}
          </Section>
        )}

        {filters.price && (
          <Section title="Precio">
            <div className="flex gap-3">
              <input
                type="number"
                placeholder={`Desde ${filters.price.min}`}
                value={get("minPrice")}
                onChange={(e) => set("minPrice", e.target.value)}
                className="w-full border border-(--border-soft) rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder={`Hasta ${filters.price.max}`}
                value={get("maxPrice")}
                onChange={(e) => set("maxPrice", e.target.value)}
                className="w-full border border-(--border-soft) rounded px-3 py-2"
              />
            </div>
          </Section>
        )}
      </Drawer>
    </Portal>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold mb-2 text-(--text-primary)">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-(--brand-primary)"
      />
      {label}
    </label>
  );
}
