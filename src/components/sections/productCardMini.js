"use client";

import Link from "next/link";
import ProductImage from "@/components/ui/productImage";
import { slugifyCategory } from "@/utils/slugify";

export default function ProductCardMini({ product }) {
  if (!product) return null;

  const savings =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice - product.price
      : 0;

  return (
    <Link
      href={`/${slugifyCategory(product.category)}/${product.slug}`}
      className="block h-full"
    >
      <article className="group relative flex h-full w-full max-w-60 flex-col overflow-hidden rounded-xl border border-(--border-soft) bg-(--bg-page) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--border-strong) hover:shadow-(--shadow-lg)">
        <div className="relative aspect-square bg-(--bg-page)">
          <ProductImage
            product={product}
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
          />
          {product.discount > 0 && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-(--danger) px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              -{product.discount}%
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          {/* Precio: Antes (tachado) y Ahora (grande) + ahorro */}
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-(--text-muted) line-through">
              Antes ${product.oldPrice.toLocaleString()}
            </span>
          )}
          <span className="text-lg font-bold text-(--text-primary)">
            ${product.price.toLocaleString()}
          </span>
          {savings > 0 && (
            <span className="text-xs font-semibold text-(--success)">
              Ahorras ${savings.toLocaleString()}
            </span>
          )}

          <p className="mt-0.5 line-clamp-2 min-h-9 text-sm text-(--text-secondary) transition group-hover:text-(--brand-accent)">
            {product.name}
          </p>

          <span className="mt-auto pt-2 text-xs font-semibold text-(--brand-primary) transition group-hover:text-(--brand-accent)">
            Ver producto →
          </span>
        </div>
      </article>
    </Link>
  );
}
