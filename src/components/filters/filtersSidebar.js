"use client";

import { useFilters } from "@/hooks/useFilters";

export default function FiltersSidebar({ filters }) {
  const { toggle, has, get, set } = useFilters();

  if (!filters) return null;

  return (
    <aside
      className="
        bg-(--bg-page)
        p-5
        rounded-xl
        border border-(--border-soft)
        shadow-sm
      "
    >
      <h3 className="font-semibold mb-4">Filtrar por</h3>

      <Group title="Disponibilidad">
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
              name="availability"
              checked={(get("availability") || "") === val}
              onChange={() => set("availability", val)}
              className="accent-(--brand-primary)"
            />
            {label}
          </label>
        ))}
      </Group>

      {filters.colors?.length > 0 && (
        <Group title="Color">
          {filters.colors.map((c) => (
            <Check
              key={c.value}
              label={`${c.label} (${c.count})`}
              checked={has("colors", c.value)}
              onChange={() => toggle("colors", c.value)}
            />
          ))}
        </Group>
      )}

      {filters.brands?.length > 0 && (
        <Group title="Marca">
          {filters.brands.map((b) => (
            <Check
              key={b.value}
              label={`${b.label} (${b.count})`}
              checked={has("brands", b.value)}
              onChange={() => toggle("brands", b.value)}
            />
          ))}
        </Group>
      )}

      <Group title="Precio">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={`Desde ${filters.price.min}`}
            value={get("minPrice")}
            onChange={(e) => set("minPrice", e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
          <input
            type="number"
            placeholder={`Hasta ${filters.price.max}`}
            value={get("maxPrice")}
            onChange={(e) => set("maxPrice", e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </Group>
    </aside>
  );
}

function Group({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium mb-2">{title}</p>
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
