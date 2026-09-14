import { slugifyCategory } from "@/utils/slugify";
import { stripHtml } from "@/utils/sanitizeHtml";
import ProductImage from "@/components/ui/productImage";
import { formatText } from "@/utils/textFormat";
import Link from "next/link";

const MENU_WIDTH = 640;
const EDGE_PADDING = 16;

export default function ListProductHeader({
  setIsHoveringMega,
  setHoveredCat,
  hoveredCat,
  closeTimer,
}) {
  const megaMenuStyle = hoveredCat
    ? (() => {
        const rawLeft =
          hoveredCat.rect.left + hoveredCat.rect.width / 2 - MENU_WIDTH / 2;

        const maxLeft = window.innerWidth - MENU_WIDTH - EDGE_PADDING;

        return {
          top: hoveredCat.rect.bottom + 10,
          left: Math.max(EDGE_PADDING, Math.min(rawLeft, maxLeft)),
          width: MENU_WIDTH,
        };
      })()
    : {};

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
      className="
        hidden md:block fixed
        bg-(--bg-page)
        shadow-(--shadow-lg)
        rounded-xl
        z-9999
        mt-1
        p-6
      "
      style={megaMenuStyle}
    >
      <div className="mb-4">
        <p className="text-lg font-semibold text-(--text-primary)">
          {formatText(hoveredCat.cat.name, "capitalize")}
        </p>
        <p className="text-sm text-(--text-muted) mt-1 line-clamp-2">
          {stripHtml(hoveredCat.cat.description)}
        </p>
      </div>

      {hoveredCat.cat.products?.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {hoveredCat.cat.products.slice(0, 4).map((product) => {
            const productSlug = `/${slugifyCategory(
              hoveredCat.cat.name,
            )}/${product.slug}`;

            return (
              <Link
                href={productSlug}
                key={product.id}
                className="
                  group relative
                  rounded-xl
                  border border-(--border-soft)
                  bg-(--bg-page)
                  p-3
                  flex flex-col
                  hover:shadow-(--shadow-md)
                  transition
                  cursor-pointer
                "
              >
                {product.discount > 0 && (
                  <span
                    className="
                      absolute top-2 left-2 z-10
                      bg-(--danger)
                      text-(--text-inverted)
                      text-xs font-semibold
                      px-2 py-0.5
                      rounded-full
                    "
                  >
                    -{product.discount}%
                  </span>
                )}

                <div className="relative w-full h-28 rounded-lg overflow-hidden">
                  <ProductImage
                    product={product}
                    className="
                      w-full h-full
                      object-contain
                      transition
                      group-hover:scale-105
                    "
                  />
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium text-(--text-primary) line-clamp-2 hover:underline">
                    {product.name}
                  </p>

                  <div className="mt-2 flex flex-col leading-tight">
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-xs text-(--text-muted) line-through">
                        ${product.oldPrice.toLocaleString()}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-(--text-primary)">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.discount > 0 && (
                        <span className="rounded bg-(--success) px-1.5 py-0.5 text-[11px] font-bold text-white">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    className="
                      mt-2 inline-block
                      text-xs font-semibold
                      text-(--brand-primary)
                      hover:text-(--brand-accent)
                      transition
                      hover:underline
                    "
                  >
                    Ver producto →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-(--text-muted)">
          No hay productos destacados en esta categoría.
        </p>
      )}

      <div className="mt-6 pt-4 border-t border-(--border-soft) text-center">
        <Link
          href={`/${slugifyCategory(hoveredCat.cat.name)}`}
          className="
            text-sm font-medium
            text-(--brand-primary)
            hover:text-(--brand-accent)
            transition
          "
        >
          Ver todos los productos →
        </Link>
      </div>
    </div>
  );
}
