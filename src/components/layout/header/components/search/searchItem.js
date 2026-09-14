"use client";
import ProductImage from "@/components/ui/productImage";

import {
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { getColorHexByName } from "@/utils/getColor";
import useProductCartLogic from "@/hooks/useProductCartLogic";
import Link from "next/link";

export default function SearchItem({ product }) {
  const {
    ready,
    hasColors,
    selectedColor,
    colorStock,
    qty,
    error,
    selectColor,
    incrementQty,
    decrementQty,
    handleAddToCart,
    alreadyInCart,
    actionLabel,
  } = useProductCartLogic(product, 1);

  if (!ready) return null;

  return (
    <article
      className="
        grid grid-cols-1
        sm:grid-cols-[96px_1fr_240px]
        gap-4 sm:gap-5
        p-4 sm:p-5
        border-b border-(--border-soft)
        bg-(--bg-page)
        hover:bg-(--bg-soft)
        transition
      "
    >
      <Link
        href={`/${product.category}/${product.slug}`}
        className="
          relative
          w-full sm:w-24
          h-40 sm:h-24
          rounded-xl
          bg-(--bg-soft)
          overflow-hidden
        "
        prefetch
      >
        <ProductImage
          product={product}
          className="w-full h-full object-contain p-3"
        />

        {product.discount > 0 && (
          <span
            className="
              absolute top-2 left-2
              bg-(--danger)
              text-white
              text-[11px]
              font-semibold
              px-2 py-0.5
              rounded-full
            "
          >
            -{product.discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-col gap-1">
        <Link href={`/${product.category}/${product.slug}`} prefetch>
          <h3
            className="
              font-semibold text-(--text-primary)
              leading-snug
              hover:underline
              line-clamp-2
            "
          >
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex flex-col">
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs line-through text-(--text-muted)">
              ${product.oldPrice.toLocaleString()}
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-(--text-primary)">
              ${product.price.toLocaleString()}
            </span>
            {product.discount > 0 && (
              <span className="rounded bg-(--success) px-1.5 py-0.5 text-xs font-bold text-white">
                {product.discount}% OFF
              </span>
            )}
          </div>
        </div>

        {hasColors && (
          <div className="flex items-center gap-2 mt-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => selectColor(c)}
                className={`
                  w-4 h-4 rounded-full border
                  transition cursor-pointer
                  ${
                    selectedColor === c.name
                      ? "border-(--brand-primary) scale-110"
                      : "border-(--border-strong)"
                  }
                `}
                style={{ backgroundColor: getColorHexByName(c.name) }}
              />
            ))}
          </div>
        )}

        <div className="min-h-7 mt-1">
          {selectedColor && (
            <p className="text-xs text-(--text-muted)">
              Stock {selectedColor}: {colorStock}
            </p>
          )}

          {alreadyInCart && (
            <p className="text-xs text-(--success)">
              ✔ Ya tienes {qty} en tu carrito
            </p>
          )}

          {error && (
            <p className="text-xs text-(--danger) font-medium">{error}</p>
          )}
        </div>
      </div>

      <div
        className="
          flex flex-col sm:items-start
          gap-3
        "
      >
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center border border-(--border-soft) rounded-lg h-9 overflow-hidden">
            <button
              onClick={decrementQty}
              className="px-3 hover:bg-(--bg-soft) cursor-pointer"
            >
              <MinusIcon className="w-4 h-4" />
            </button>

            <span className="px-4 text-sm font-semibold">{qty}</span>

            <button
              onClick={incrementQty}
              disabled={qty >= colorStock}
              className="px-3 hover:bg-(--bg-soft) disabled:opacity-40 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="
            w-full
            flex items-center justify-center gap-2
            bg-(--cta-primary)
            hover:bg-(--cta-primary-hover)
            text-white
            py-2 rounded-lg
            text-sm font-medium
            transition
            cursor-pointer
          "
        >
          <ShoppingCartIcon className="w-4 h-4" />
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
