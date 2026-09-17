"use client";

import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useFilters } from "@/hooks/useFilters";

const cop = (n) => "$" + Number(n || 0).toLocaleString("es-CO");

// Buckets de precio típicos (COP). Se filtran según el máximo del catálogo.
const BASE_RANGES = [
  { min: "", max: "50000" },
  { min: "50000", max: "100000" },
  { min: "100000", max: "200000" },
  { min: "200000", max: "500000" },
  { min: "500000", max: "" },
];

function rangeLabel({ min, max }) {
  if (!min) return `Hasta ${cop(max)}`;
  if (!max) return `Más de ${cop(min)}`;
  return `${cop(min)} a ${cop(max)}`;
}

/**
 * Cuerpo de filtros reutilizable por el sidebar (desktop) y el drawer (mobile).
 * Todo se pinta con tokens del tema y es responsive.
 */
export default function FilterGroups({ filters }) {
  const { toggle, has, get, set, setMany } = useFilters();

  if (!filters) return null;

  return (
    <div className="space-y-5">
      <Availability get={get} set={set} />

      {filters.price && (
        <PriceGroup price={filters.price} get={get} setMany={setMany} />
      )}

      {filters.brands?.length > 0 && (
        <OptionsGroup
          title="Marca"
          paramKey="brands"
          options={filters.brands}
          has={has}
          toggle={toggle}
          searchable
        />
      )}

      {filters.colors?.length > 0 && (
        <OptionsGroup
          title="Color"
          paramKey="colors"
          options={filters.colors}
          has={has}
          toggle={toggle}
        />
      )}
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div className="border-t border-(--border-soft) pt-4 first:border-t-0 first:pt-0">
      <p className="mb-2.5 text-sm font-semibold text-(--text-primary)">
        {title}
      </p>
      {children}
    </div>
  );
}

function Availability({ get, set }) {
  const value = get("availability") || "";
  const opts = [
    ["", "Todos"],
    ["in", "Disponibles"],
    ["out", "Agotados"],
  ];
  return (
    <Group title="Disponibilidad">
      <div className="flex flex-wrap gap-2">
        {opts.map(([val, label]) => {
          const active = value === val;
          return (
            <button
              key={val || "all"}
              type="button"
              onClick={() => set("availability", val)}
              className={`rounded-full border px-3 py-1.5 text-sm transition cursor-pointer ${
                active
                  ? "border-(--brand-primary) bg-(--brand-primary) text-(--text-inverted)"
                  : "border-(--border-soft) text-(--text-secondary) hover:border-(--border-strong)"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </Group>
  );
}

function PriceGroup({ price, get, setMany }) {
  const [min, setMin] = useState(get("minPrice"));
  const [max, setMax] = useState(get("maxPrice"));

  // Sincroniza si cambian por chips/limpiar desde afuera.
  const urlMin = get("minPrice");
  const urlMax = get("maxPrice");
  useEffect(() => setMin(urlMin), [urlMin]);
  useEffect(() => setMax(urlMax), [urlMax]);

  const ranges = useMemo(
    () => BASE_RANGES.filter((r) => !r.min || Number(r.min) < Number(price.max || Infinity)),
    [price.max],
  );

  const apply = () =>
    setMany({ minPrice: min || "", maxPrice: max || "" });

  const isActiveRange = (r) =>
    (r.min || "") === (urlMin || "") && (r.max || "") === (urlMax || "");

  return (
    <Group title="Precio">
      <div className="mb-3 flex flex-col gap-1.5">
        {ranges.map((r) => {
          const active = isActiveRange(r);
          return (
            <button
              key={`${r.min}-${r.max}`}
              type="button"
              onClick={() =>
                setMany({ minPrice: r.min, maxPrice: r.max })
              }
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition cursor-pointer hover:bg-(--bg-soft) ${
                active
                  ? "font-semibold text-(--brand-accent)"
                  : "text-(--text-secondary)"
              }`}
            >
              <span
                className={`h-3.5 w-3.5 flex-none rounded-full border ${
                  active
                    ? "border-(--brand-accent) bg-(--brand-accent)"
                    : "border-(--border-strong)"
                }`}
              />
              {rangeLabel(r)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder={cop(price.min)}
          value={min}
          onChange={(e) => setMin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          className="w-full rounded-md border border-(--border-soft) bg-(--bg-page) px-2 py-1.5 text-sm text-(--text-primary) focus:border-(--brand-accent) focus:outline-none"
        />
        <span className="text-(--text-muted)">–</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder={cop(price.max)}
          value={max}
          onChange={(e) => setMax(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          className="w-full rounded-md border border-(--border-soft) bg-(--bg-page) px-2 py-1.5 text-sm text-(--text-primary) focus:border-(--brand-accent) focus:outline-none"
        />
        <button
          type="button"
          onClick={apply}
          aria-label="Aplicar precio"
          className="flex-none rounded-md bg-(--cta-primary) px-3 py-1.5 text-sm font-semibold text-(--text-inverted) transition hover:bg-(--cta-primary-hover) cursor-pointer"
        >
          Ir
        </button>
      </div>
    </Group>
  );
}

function OptionsGroup({ title, paramKey, options, has, toggle, searchable }) {
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState("");
  const LIMIT = 6;

  const filtered = useMemo(() => {
    if (!q.trim()) return options;
    const term = q.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(term));
  }, [q, options]);

  const visible = expanded ? filtered : filtered.slice(0, LIMIT);
  const showToggle = filtered.length > LIMIT;

  return (
    <Group title={title}>
      {searchable && options.length > 10 && (
        <div className="relative mb-2">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Buscar ${title.toLowerCase()}…`}
            className="w-full rounded-md border border-(--border-soft) bg-(--bg-page) py-1.5 pl-8 pr-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--brand-accent) focus:outline-none"
          />
        </div>
      )}

      <div className="space-y-0.5">
        {visible.map((o) => {
          const checked = has(paramKey, o.value);
          return (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm transition hover:bg-(--bg-soft)"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(paramKey, o.value)}
                className="h-4 w-4 accent-(--brand-primary)"
              />
              <span
                className={`min-w-0 flex-1 truncate ${
                  checked
                    ? "font-medium text-(--text-primary)"
                    : "text-(--text-secondary)"
                }`}
              >
                {o.label}
              </span>
              <span className="flex-none text-xs text-(--text-muted)">
                {o.count}
              </span>
            </label>
          );
        })}
        {visible.length === 0 && (
          <p className="px-1.5 py-1 text-sm text-(--text-muted)">Sin resultados</p>
        )}
      </div>

      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-sm font-semibold text-(--brand-accent) hover:underline cursor-pointer"
        >
          {expanded ? "Ver menos" : `Ver ${filtered.length - LIMIT} más`}
        </button>
      )}
    </Group>
  );
}
