"use client";

import { PlusIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import ProductImage from "@/components/ui/productImage";
import { getColorHexByName } from "@/utils/getColor";
import useProductCartLogic from "@/hooks/useProductCartLogic";
import useVertical from "@/hooks/useVertical";

export default function CatalogProductCard({ product, category }) {
  const {
    ready,
    hasColors,
    hasSize,
    isWeight,
    colorOptions,
    selectedColor,
    colorStock,
    qty,
    error,
    selectColor,
    handleAddToCart,
    alreadyInCart,
    actionLabel,
  } = useProductCartLogic({ ...product, category }, 1);
  const v = useVertical();

  if (!ready) return null;

  // Layout "menú" (restaurante / comida rápida / cafetería): tarjeta horizontal
  // con foto + nombre + descripción + precio y botón de agregar.
  if (v.layout === "menu") {
    return (
      <article className="group flex gap-3 sm:gap-4 rounded-2xl border border-(--border-soft) bg-(--bg-page) p-3 transition-all hover:shadow-(--shadow-lg)">
        <Link
          href={`/${category}/${product.slug}`}
          className="relative h-24 w-24 flex-none overflow-hidden rounded-xl bg-(--bg-soft) sm:h-28 sm:w-28"
        >
          <ProductImage
            product={product}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.discount > 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-(--danger) px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{product.discount}%
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/${category}/${product.slug}`}>
            <h3 className="line-clamp-1 font-semibold text-(--text-primary) hover:underline">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-(--text-muted)">
              {product.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="flex items-end gap-2">
              <span className="text-base font-bold text-(--cta-primary)">
                ${product.price.toLocaleString()}
                {isWeight && (
                  <span className="text-xs font-medium text-(--text-muted)">
                    {" "}
                    /kg
                  </span>
                )}
              </span>
              {product.oldPrice && (
                <span className="text-xs line-through text-(--text-muted)">
                  ${product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="flex flex-none items-center gap-1 rounded-lg bg-(--cta-primary) px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-(--cta-primary-hover) cursor-pointer"
            >
              <PlusIcon className="h-4 w-4" />
              {alreadyInCart ? `✔ ${qty}` : v.addToCart}
            </button>
          </div>
          {error && (
            <p className="mt-1 text-xs font-medium text-(--danger)">{error}</p>
          )}
        </div>
      </article>
    );
  }

  // Tarjeta estilo tienda grande (Mercado Libre): imagen limpia, precio
  // prominente con % de descuento, título liviano y una acción clara. Colores
  // 100% del tema del dueño.
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-(--border-soft) bg-(--bg-page) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--border-strong) hover:shadow-(--shadow-lg)">
      <Link href={`/${category}/${product.slug}`} className="relative block">
        <div className="relative aspect-square bg-(--bg-page)">
          <ProductImage
            product={product}
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04]"
          />
          {product.discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-(--danger) px-2 py-1 text-[11px] font-bold text-white shadow-sm sm:text-xs">
              -{product.discount}%
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        {/* Precio (estilo ML): valor anterior arriba, precio grande y % en verde */}
        {product.oldPrice && (
          <span className="text-xs text-(--text-muted) line-through">
            ${product.oldPrice.toLocaleString()}
          </span>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-(--text-primary) sm:text-2xl">
            ${product.price.toLocaleString()}
            {isWeight && (
              <span className="text-xs font-medium text-(--text-muted)"> /kg</span>
            )}
          </span>
          {product.discount > 0 && (
            <span className="text-sm font-semibold text-(--success)">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Título liviano, 2 líneas (como ML) */}
        <Link href={`/${category}/${product.slug}`}>
          <h3 className="mt-0.5 line-clamp-2 min-h-9 text-sm text-(--text-secondary) transition hover:text-(--brand-accent)">
            {product.name}
          </h3>
        </Link>

        {/* Colores (compacto) */}
        {hasColors && (
          <div className="mt-1 flex items-center gap-1.5">
            {colorOptions.map((c) => (
              <button
                key={c.name}
                onClick={() => selectColor(c)}
                aria-label={`Color ${c.name}`}
                className={`h-4 w-4 rounded-full border transition cursor-pointer sm:h-5 sm:w-5 ${
                  selectedColor === c.name
                    ? "border-(--brand-accent) scale-110"
                    : "border-(--border-strong)"
                }`}
                style={{ backgroundColor: getColorHexByName(c.name) }}
              />
            ))}
          </div>
        )}

        {/* Estado (stock/carrito) sin ocupar mucho espacio */}
        <div className="min-h-4">
          {selectedColor && colorStock <= 5 && (
            <p className="text-xs font-medium text-(--warning)">
              ¡Solo quedan {colorStock}!
            </p>
          )}
          {alreadyInCart && (
            <p className="text-xs text-(--success)">✔ {qty} en tu carrito</p>
          )}
          {error && <p className="text-xs font-medium text-(--danger)">{error}</p>}
        </div>

        {/* Acción */}
        <div className="mt-auto pt-1">
          {hasSize ? (
            <Link
              href={`/${category}/${product.slug}`}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-(--cta-primary) p-2 text-sm font-semibold text-(--cta-primary) transition hover:bg-(--cta-primary) hover:text-white"
            >
              Ver opciones
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-(--cta-primary) p-2 text-sm font-semibold text-white transition hover:bg-(--cta-primary-hover) cursor-pointer"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
