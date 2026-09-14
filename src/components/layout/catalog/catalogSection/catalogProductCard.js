"use client";

import { useState } from "react";
import {
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
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
    incrementQty,
    decrementQty,
    handleAddToCart,
    alreadyInCart,
  } = useProductCartLogic({ ...product, category }, 1);
  const v = useVertical();
  const [imgIndex, setImgIndex] = useState(0);

  if (!ready) return null;

  // Etiquetas del producto.
  const lowStock = colorStock > 0 && colorStock <= 5;
  const productTags = Array.isArray(product.tags) ? product.tags.slice(0, 3) : [];

  // Galería para el hover (varias fotos del producto). Acepta images[] o image
  // (arreglo o string).
  const gallery = (
    Array.isArray(product.images) && product.images.length
      ? product.images
      : Array.isArray(product.image)
        ? product.image
        : product.image
          ? [product.image]
          : []
  ).filter(Boolean);
  const hasGallery = gallery.length > 1;
  const currentImg = gallery[Math.min(imgIndex, gallery.length - 1)];
  const goImg = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((i) => (i + dir + gallery.length) % gallery.length);
  };

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
      {/* Imagen con galería en hover (cambiar fotos sin salir de la lista) */}
      <div className="relative aspect-square bg-(--bg-page)">
        <Link href={`/${category}/${product.slug}`} className="block h-full w-full">
          {currentImg ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={currentImg}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <ProductImage
              product={product}
              className="h-full w-full object-contain p-4"
            />
          )}
        </Link>

        {/* Etiquetas sobre la imagen */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
          {lowStock && (
            <span className="rounded-md bg-(--warning) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              ¡Últimas {colorStock}!
            </span>
          )}
          {productTags.map((t) => (
            <span
              key={t}
              className="rounded-md bg-(--brand-primary) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Galería en hover: flechas + puntos */}
        {hasGallery && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={(e) => goImg(e, -1)}
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-(--bg-page)/90 text-(--text-primary) opacity-0 shadow transition group-hover:opacity-100 hover:bg-(--bg-page) cursor-pointer"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={(e) => goImg(e, 1)}
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-(--bg-page)/90 text-(--text-primary) opacity-0 shadow transition group-hover:opacity-100 hover:bg-(--bg-page) cursor-pointer"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1 opacity-0 transition group-hover:opacity-100">
              {gallery.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === imgIndex ? "w-4 bg-(--cta-primary)" : "w-1.5 bg-(--border-strong)"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        {/* Precio: Antes (tachado) + Ahora (grande) + % OFF en verde */}
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="text-xs text-(--text-muted) line-through">
            ${product.oldPrice.toLocaleString()}
          </span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-(--text-primary) sm:text-2xl">
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

        {/* Título liviano, 2 líneas */}
        <Link href={`/${category}/${product.slug}`}>
          <h3 className="mt-0.5 line-clamp-2 min-h-9 text-sm text-(--text-secondary) transition hover:text-(--brand-accent)">
            {product.name}
          </h3>
        </Link>

        {/* Colores (compacto) */}
        {hasColors && (
          <div className="flex items-center gap-1.5">
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

        {/* Estado (carrito / error) */}
        <div className="min-h-4">
          {alreadyInCart && (
            <p className="text-xs text-(--success)">✔ En tu carrito</p>
          )}
          {error && <p className="text-xs font-medium text-(--danger)">{error}</p>}
        </div>

        {/* Acción: cantidad fácil (+/−) + agregar */}
        <div className="mt-auto flex flex-col gap-2 pt-1">
          {hasSize ? (
            <Link
              href={`/${category}/${product.slug}`}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-(--cta-primary) p-2 text-sm font-semibold text-(--cta-primary) transition hover:bg-(--cta-primary) hover:text-white"
            >
              Ver opciones
            </Link>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg border border-(--border-soft)">
                <button
                  onClick={decrementQty}
                  aria-label="Disminuir"
                  className="flex h-9 w-10 items-center justify-center text-(--text-secondary) transition hover:bg-(--bg-soft) cursor-pointer"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-(--text-primary)">
                  {qty}
                  {isWeight ? " kg" : ""}
                </span>
                <button
                  onClick={incrementQty}
                  disabled={qty >= colorStock}
                  aria-label="Aumentar"
                  className="flex h-9 w-10 items-center justify-center text-(--text-secondary) transition hover:bg-(--bg-soft) disabled:opacity-40 cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-(--cta-primary) p-2 text-sm font-semibold text-white transition hover:bg-(--cta-primary-hover) cursor-pointer"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                {alreadyInCart ? "Actualizar" : "Agregar"}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
