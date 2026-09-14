"use client";

import { useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./productCard";
import SkeletonGrid from "@/components/ui/skeletons/skeletonGrid";
import Breadcrumbs from "../breadcrumbs";
import MobileFiltersBar from "@/components/filters/mobileFiltersBar";
import { DesktopSort } from "@/components/filters/desktopSort";
import useVertical from "@/hooks/useVertical";
import { isOutOfStock } from "@/utils/stock";

export default function ProductsSection({ category, catalog }) {
  const { products, filters, loadMore, hasMore, loadingMore } = catalog;
  const v = useVertical();
  const searchParams = useSearchParams();

  // Filtro de disponibilidad (cliente): la API trae el listado completo, así que
  // se combina con los demás filtros que ya aplicó el backend.
  const availability = searchParams.get("availability") || "";
  const shown = availability
    ? products.filter((p) =>
        availability === "out" ? isOutOfStock(p) : !isOutOfStock(p),
      )
    : products;
  // En verticales de menú (restaurante/comida) el catálogo se lista en filas
  // anchas (1-2 columnas); en retail sigue en grilla densa.
  const isMenu = v.layout === "menu";
  const gridClass = isMenu
    ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
    : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5";

  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { rootMargin: "200px" },
    );

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  return (
    <section className="space-y-4">
      <MobileFiltersBar total={shown.length} filters={filters} />

      <div className="md:hidden px-4">
        <Breadcrumbs category={category} />
      </div>

      <div className="hidden md:flex justify-between items-center">
        <Breadcrumbs category={category} />
        <DesktopSort filters={filters} />
      </div>

      <div>
        {products.length === 0 && loadingMore && (
          <SkeletonGrid count={9} cols="grid-cols-2 md:grid-cols-3" compact />
        )}

        {shown.length > 0 && (
          <div className={gridClass}>
            {shown.map((product) => (
              <ProductCard
                key={`${product.id}-${product.slug}`}
                product={product}
                category={category}
              />
            ))}
          </div>
        )}

        {!loadingMore && shown.length === 0 && (
          <div className="py-20 text-center text-(--text-muted)">
            {availability === "out"
              ? "No hay productos agotados."
              : availability === "in"
                ? "No hay productos disponibles con estos filtros."
                : "No se encontraron productos."}
          </div>
        )}

        {products.length > 0 && loadingMore && (
          <SkeletonGrid count={6} cols="grid-cols-2 md:grid-cols-3" compact />
        )}

        {hasMore && <div ref={sentinelRef} className="h-1" />}
      </div>
    </section>
  );
}
