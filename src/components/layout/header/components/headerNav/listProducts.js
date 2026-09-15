import { slugifyCategory } from "@/utils/slugify";
import { stripHtml } from "@/utils/sanitizeHtml";
import { isOutOfStock } from "@/utils/stock";
import ProductImage from "@/components/ui/productImage";
import { formatText } from "@/utils/textFormat";
import Link from "next/link";

const MENU_WIDTH = 720;
const EDGE_PADDING = 16;

export default function ListProductHeader({
  setIsHoveringMega,
  setHoveredCat,
  hoveredCat,
  closeTimer,
}) {
  const catSlug = slugifyCategory(hoveredCat.cat.name);
  const desc = stripHtml(hoveredCat.cat.description);

  const megaMenuStyle = (() => {
    const rawLeft =
      hoveredCat.rect.left + hoveredCat.rect.width / 2 - MENU_WIDTH / 2;
    const maxLeft = window.innerWidth - MENU_WIDTH - EDGE_PADDING;
    return {
      top: hoveredCat.rect.bottom + 6,
      left: Math.max(EDGE_PADDING, Math.min(rawLeft, maxLeft)),
      width: MENU_WIDTH,
    };
  })();

  const products = hoveredCat.cat.products?.slice(0, 4) || [];

  return (
    <div
      onMouseEnter={() => {
        clearTimeout(closeTimer.current);
        setIsHoveringMega(true);
      }}
      onMouseLeave={() => {
        setIsHoveringMega(false);
        setHoveredCat(null);
      }}
      className="mega-pop fixed z-9999 hidden overflow-hidden rounded-2xl border border-(--border-soft) bg-(--bg-page) shadow-(--shadow-lg) ring-1 ring-black/5 md:block"
      style={megaMenuStyle}
    >
      {/* Cabecera: categoría + ver todos */}
      <div className="flex items-center justify-between gap-4 border-b border-(--border-soft) bg-(--bg-soft) px-5 py-3">
        <div className="min-w-0">
          <p className="text-base font-bold text-(--text-primary)">
            {formatText(hoveredCat.cat.name, "capitalize")}
          </p>
          {desc && (
            <p className="line-clamp-1 text-xs text-(--text-muted)">{desc}</p>
          )}
        </div>
        <Link
          href={`/${catSlug}`}
          className="flex-none rounded-full bg-(--cta-primary) px-3.5 py-1.5 text-xs font-semibold text-(--text-inverted) transition hover:opacity-90"
        >
          Ver todos
        </Link>
      </div>

      {/* Productos */}
      {products.length > 0 ? (
        <div className="grid grid-cols-4 gap-3 p-5">
          {products.map((product) => {
            const soldOut = isOutOfStock(product);
            return (
              <Link
                href={`/${catSlug}/${product.slug}`}
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-(--border-soft) bg-(--bg-page) transition hover:-translate-y-0.5 hover:border-(--border-strong) hover:shadow-(--shadow-md)"
              >
                <div className="relative aspect-square overflow-hidden bg-(--bg-page)">
                  <ProductImage
                    product={product}
                    className={`absolute inset-0 h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105 ${
                      soldOut ? "opacity-45 grayscale" : ""
                    }`}
                  />
                  {!soldOut && product.discount > 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-(--success) px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      {product.discount}% OFF
                    </span>
                  )}
                  {soldOut && (
                    <span className="absolute left-2 top-2 rounded-md bg-(--text-muted) px-1.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                      Agotado
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="line-clamp-2 min-h-8 text-xs text-(--text-secondary) transition group-hover:text-(--brand-accent)">
                    {product.name}
                  </p>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-[11px] text-(--text-muted) line-through">
                      ${product.oldPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-sm font-bold text-(--text-primary)">
                    ${product.price.toLocaleString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-(--text-muted)">
          No hay productos destacados en esta categoría.
        </p>
      )}

      <style>{`
        @keyframes megaPop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .mega-pop { animation: megaPop .16s ease both; }
        @media (prefers-reduced-motion: reduce) { .mega-pop { animation: none; } }
      `}</style>
    </div>
  );
}
