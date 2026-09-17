"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { slugifyCategory } from "@/utils/slugify";
import { formatText } from "@/utils/textFormat";

export default function DesktopHeaderNav({
  categories,
  activeSlug,
  onNavigate,
  closeTimer,
  setHoveredCat,
  isHoveringMega,
}) {
  const scrollRef = useRef(null);
  const itemRefs = useRef({});
  const catBoxRef = useRef(null);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  useEffect(() => {
    requestAnimationFrame(() => updateArrows());
  }, [categories, updateArrows]);

  // Cierra el panel "Categorías" al hacer clic fuera o presionar Escape.
  useEffect(() => {
    if (!catOpen) return;
    const onClick = (e) => {
      if (catBoxRef.current && !catBoxRef.current.contains(e.target)) {
        setCatOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setCatOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [catOpen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (activeSlug === "home" || activeSlug === "novedades") {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    const item = itemRefs.current[activeSlug];
    if (!item) return;

    const target = item.offsetLeft - el.clientWidth / 2 + item.clientWidth / 2;
    el.scrollTo({
      left: Math.max(0, Math.min(target, el.scrollWidth)),
      behavior: "smooth",
    });
  }, [activeSlug, categories]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const NAV_ITEMS = [
    { key: "home", label: "Inicio" },
    { key: "novedades", label: "Novedades" },
    { key: "ofertas", label: "Ofertas" },
  ];

  const linkClass = (active) =>
    `relative whitespace-nowrap py-3 text-sm font-medium transition
     after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full
     after:bg-white after:transition-transform after:duration-200
     ${
       active
         ? "font-semibold after:scale-x-100"
         : "text-white/85 hover:text-white after:scale-x-0 hover:after:scale-x-100"
     }`;

  return (
    <div className="relative hidden items-center gap-1 md:flex">
      {/* ---- Botón "Categorías" con panel de todas ---- */}
      <div ref={catBoxRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setCatOpen((v) => !v)}
          aria-expanded={catOpen}
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 cursor-pointer"
        >
          <Squares2X2Icon className="h-5 w-5" />
          <span className="hidden lg:inline">Categorías</span>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${catOpen ? "rotate-180" : ""}`}
          />
        </button>

        {catOpen && (
          <div className="cat-pop absolute left-0 top-full z-50 mt-2 w-[min(92vw,640px)] overflow-hidden rounded-2xl border border-(--border-soft) bg-(--bg-page) text-(--text-primary) shadow-(--shadow-lg) ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-(--border-soft) bg-(--bg-soft) px-4 py-2.5">
              <p className="text-sm font-bold">Todas las categorías</p>
              <button
                onClick={() => {
                  onNavigate("home");
                  setCatOpen(false);
                }}
                className="text-xs font-semibold text-(--brand-accent) hover:underline cursor-pointer"
              >
                Ver todo
              </button>
            </div>
            <div className="grid max-h-[70vh] grid-cols-2 gap-0.5 overflow-y-auto p-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const slug = slugifyCategory(cat.name);
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onNavigate(slug);
                      setCatOpen(false);
                    }}
                    className={`truncate rounded-lg px-3 py-2 text-left text-sm transition hover:bg-(--bg-soft) hover:text-(--brand-accent) cursor-pointer ${
                      activeSlug === slug
                        ? "bg-(--bg-soft) font-semibold text-(--brand-accent)"
                        : "text-(--text-secondary)"
                    }`}
                    title={formatText(cat.name, "capitalize")}
                  >
                    {formatText(cat.name, "capitalize")}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <span className="mx-1 h-6 w-px shrink-0 bg-white/20" />

      {/* ---- Accesos rápidos ---- */}
      <div className="flex shrink-0 items-center gap-5 px-1">
        {NAV_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={linkClass(activeSlug === key) + " cursor-pointer"}
          >
            {label}
          </button>
        ))}
      </div>

      <span className="mx-1 h-6 w-px shrink-0 bg-white/20" />

      {/* ---- Chips de categorías (scroll horizontal con degradado + flechas) ---- */}
      <div className="relative min-w-0 flex-1">
        {/* Degradados de borde para insinuar más contenido */}
        {canLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-(--brand-primary) to-transparent" />
        )}
        {canRight && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-(--brand-primary) to-transparent" />
        )}

        {canLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Desplazar categorías a la izquierda"
            className="absolute left-0 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-(--brand-primary) shadow-md transition hover:scale-105 cursor-pointer"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        )}

        <div ref={scrollRef} className="scrollbar-hide overflow-x-auto">
          <div className="flex items-center gap-5 whitespace-nowrap px-1">
            {categories.map((cat) => {
              const slug = slugifyCategory(cat.name);
              return (
                <button
                  key={cat.id}
                  ref={(el) => (itemRefs.current[slug] = el)}
                  onClick={() => onNavigate(slug)}
                  onMouseEnter={(e) => {
                    clearTimeout(closeTimer.current);
                    setHoveredCat({
                      cat,
                      rect: e.currentTarget.getBoundingClientRect(),
                    });
                  }}
                  onMouseLeave={() => {
                    closeTimer.current = setTimeout(() => {
                      if (!isHoveringMega) setHoveredCat(null);
                    }, 120);
                  }}
                  className={linkClass(activeSlug === slug) + " cursor-pointer"}
                >
                  {formatText(cat.name, "capitalize")}
                </button>
              );
            })}
          </div>
        </div>

        {canRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Desplazar categorías a la derecha"
            className="absolute right-0 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-(--brand-primary) shadow-md transition hover:scale-105 cursor-pointer"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <style>{`
        @keyframes catPop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .cat-pop { animation: catPop .16s ease both; }
        @media (prefers-reduced-motion: reduce) { .cat-pop { animation: none; } }
      `}</style>
    </div>
  );
}
