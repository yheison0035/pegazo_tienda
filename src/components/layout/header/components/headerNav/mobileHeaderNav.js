"use client";

import { useEffect, useRef } from "react";
import { slugifyCategory } from "@/utils/slugify";
import { formatText } from "@/utils/textFormat";

export default function MobileHeaderNav({ categories, activeSlug, onNavigate }) {
  const containerRef = useRef(null);
  const itemRefs = useRef({});

  const items = [
    { label: "Inicio", slug: "home", fixed: true },
    { label: "Novedades", slug: "novedades", fixed: true },
    { label: "Ofertas", slug: "ofertas", fixed: true },
    { label: "Más vendidos", slug: "mas-vendidos", fixed: true },
    ...categories.map((c) => ({
      label: c.name,
      slug: slugifyCategory(c.name),
    })),
  ];

  useEffect(() => {
    const el = itemRefs.current[activeSlug];
    const container = containerRef.current;
    if (!el || !container) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    });
  }, [activeSlug, categories]);

  return (
    <div className="relative md:hidden">
      {/* Degradados en los bordes para insinuar que hay más para deslizar */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-(--brand-primary) to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-(--brand-primary) to-transparent" />

      <div ref={containerRef} className="scrollbar-hide overflow-x-auto">
        <div className="flex gap-2 py-2.5 px-3 whitespace-nowrap">
          {items.map((item) => {
            const active = activeSlug === item.slug;
            return (
              <button
                key={item.slug}
                ref={(el) => (itemRefs.current[item.slug] = el)}
                onClick={() => onNavigate(item.slug)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-white font-semibold text-(--brand-primary) shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.fixed ? item.label : formatText(item.label, "capitalize")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
