"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import SkeletonGrid from "../ui/skeletons/skeletonGrid";
import ProductCard from "@/components/layout/catalog/catalogSection/productCard";
import CategoryCard from "./categoryCard";
import { slugifyCategory } from "@/utils/slugify";

export default function HorizontalSection({
  title,
  subtitle,
  items = [],
  loading = false,

  type = "category",
  layout = "grid",

  itemsPerPageDesktop = 6,
  itemsPerPageMobile = 4,
}) {
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const ITEMS_PER_PAGE = isMobile ? itemsPerPageMobile : itemsPerPageDesktop;

  const totalPages =
    layout === "grid" ? Math.ceil(items.length / ITEMS_PER_PAGE) : 1;

  const visibleItems = useMemo(() => {
    if (layout !== "grid") return items;
    const start = page * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [items, page, ITEMS_PER_PAGE, layout]);

  const canPrev = layout === "grid" ? page > 0 : true;
  const canNext = layout === "grid" ? page < totalPages - 1 : true;

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const amount = 260; // ancho card + gap
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-(--text-primary)">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-(--text-muted) mt-2">{subtitle}</p>
        )}
      </div>

      <div className="relative">
        <Arrow
          direction="left"
          disabled={!canPrev}
          onClick={() =>
            layout === "grid"
              ? canPrev && setPage((p) => p - 1)
              : scroll("left")
          }
        />

        <Arrow
          direction="right"
          disabled={!canNext}
          onClick={() =>
            layout === "grid"
              ? canNext && setPage((p) => p + 1)
              : scroll("right")
          }
        />

        {loading ? (
          <SkeletonGrid
            count={ITEMS_PER_PAGE}
            compact
            cols={
              layout === "grid"
                ? "grid-cols-2 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-4"
            }
          />
        ) : layout === "grid" ? (
          <div className="relative px-2 sm:px-16">
            <div className="grid auto-rows-fr gap-4 grid-cols-2 sm:grid-cols-3">
              {visibleItems.map((item) => {
                if (type === "category") {
                  return <CategoryCard key={item.id} category={item} />;
                }

                if (type === "product") {
                  return (
                    <ProductCard
                      key={item.id}
                      product={item}
                      category={slugifyCategory(item.category)}
                    />
                  );
                }

                return null;
              })}
            </div>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-hide px-2 sm:px-16"
          >
            {items.map((item) => (
              <div key={item.id} className="flex min-w-60 max-w-64">
                <ProductCard
                  product={item}
                  category={slugifyCategory(item.category)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {layout === "grid" && (
        <div className="flex sm:hidden justify-center gap-6 pt-14">
          <Arrow
            direction="left"
            disabled={!canPrev}
            onClick={() => canPrev && setPage((p) => p - 1)}
            mobile
          />
          <Arrow
            direction="right"
            disabled={!canNext}
            onClick={() => canNext && setPage((p) => p + 1)}
            mobile
          />
        </div>
      )}
    </section>
  );
}

function Arrow({ direction, disabled, onClick, mobile }) {
  const Icon = direction === "left" ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      aria-disabled={disabled}
      className={`
        ${mobile ? "" : "hidden sm:flex absolute"}
        ${direction === "left" ? "left-3" : "right-3"}
        top-1/2 -translate-y-1/2

        w-10 h-10
        rounded-full
        bg-(--bg-page)
        border border-(--border-soft)
        shadow-(--shadow-md)

        flex items-center justify-center
        transition-opacity duration-200
        z-20

        ${
          disabled
            ? "opacity-30 cursor-default"
            : "opacity-90 hover:opacity-100 cursor-pointer"
        }
      `}
    >
      <Icon className="w-5 h-5 text-(--brand-primary)" />
    </button>
  );
}
