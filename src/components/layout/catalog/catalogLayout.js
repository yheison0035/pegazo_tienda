"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FiltersSidebar from "@/components/filters/filtersSidebar";
import ProductsSection from "./catalogSection/productsSection";
import { useCatalog } from "@/hooks/useCatalog";
import FiltersSidebarSkeleton from "@/components/ui/skeletons/filtersSidebarSkeleton";

export default function CatalogLayout({ category, initialCatalog = null }) {
  const searchParams = useSearchParams();

  const filtersFromUrl = useMemo(
    () => ({
      colors: searchParams.get("colors") || "",
      brands: searchParams.get("brands") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "",
    }),
    [searchParams],
  );

  const catalogParams = useMemo(() => {
    if (category === "novedades") return { mode: "new", ...filtersFromUrl };
    if (category === "ofertas") return { mode: "offers", ...filtersFromUrl };
    return { mode: "category", category, ...filtersFromUrl };
  }, [category, filtersFromUrl]);

  const catalog = useCatalog(catalogParams, initialCatalog);

  return (
    <div className="mt-4 rounded-lg border border-(--border-soft) bg-(--bg-page) p-4 md:mt-5 md:p-6">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside
          className="
            hidden lg:block
            sticky
            top-[calc(var(--header-nav-height)+16px)]
            self-start
            max-h-[calc(100dvh-var(--header-nav-height)-32px)]
            overflow-y-auto overscroll-contain scrollbar-hide
            lg:border-r lg:border-(--border-soft) lg:pr-6
          "
        >
          {catalog.filters ? (
            <FiltersSidebar filters={catalog.filters} />
          ) : (
            <FiltersSidebarSkeleton />
          )}
        </aside>

        <ProductsSection category={category} catalog={catalog} />
      </section>
    </div>
  );
}
