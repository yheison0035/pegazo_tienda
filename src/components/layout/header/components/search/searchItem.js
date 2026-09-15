"use client";

import Link from "next/link";
import ProductImage from "@/components/ui/productImage";
import FavoriteButton from "@/components/ui/favoriteButton";
import { isOutOfStock } from "@/utils/stock";

// Fila de resultado del buscador: limpia y 100% clickeable (lleva al producto).
export default function SearchItem({ product }) {
  const soldOut = isOutOfStock(product);

  return (
    <Link
      href={`/${product.category}/${product.slug}`}
      prefetch
      className="group flex items-center gap-4 border-b border-(--border-soft) px-4 py-3 transition last:border-0 hover:bg-(--bg-soft)"
    >
      {/* Imagen */}
      <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg border border-(--border-soft) bg-(--bg-page)">
        <ProductImage
          product={product}
          className={`h-full w-full object-contain p-1.5 transition group-hover:scale-105 ${
            soldOut ? "opacity-45 grayscale" : ""
          }`}
        />
        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-(--text-muted)/90 py-0.5 text-center text-[9px] font-bold uppercase text-white">
            Agotado
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-medium text-(--text-primary) transition group-hover:text-(--brand-accent)">
          {product.name}
        </h3>
        {product.brand && (
          <p className="line-clamp-1 text-xs text-(--text-muted)">
            {product.brand}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-(--text-muted) line-through">
              ${product.oldPrice.toLocaleString()}
            </span>
          )}
          <span className="text-base font-bold text-(--text-primary)">
            ${product.price.toLocaleString()}
          </span>
          {product.discount > 0 && (
            <span className="rounded bg-(--success) px-1.5 py-0.5 text-[11px] font-bold text-white">
              {product.discount}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Favorito */}
      <FavoriteButton product={product} variant="plain" />

      {/* Flecha */}
      <span className="flex-none text-(--text-muted) transition group-hover:translate-x-0.5 group-hover:text-(--brand-accent)">
        →
      </span>
    </Link>
  );
}
