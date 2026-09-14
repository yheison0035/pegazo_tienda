"use client";

import { useState } from "react";
import {
  PlusIcon,
  MinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import ProductImage from "@/components/ui/productImage";
import useProductCartLogic from "@/hooks/useProductCartLogic";
import useVertical from "@/hooks/useVertical";
import { useWebsiteContext } from "@/context/websiteContext";
import { isOutOfStock } from "@/utils/stock";
import { stripHtml } from "@/utils/sanitizeHtml";

export default function CatalogProductCard({ product, category }) {
  const {
    ready,
    isWeight,
    colorStock,
    qty,
    error,
    handleAddToCart,
    incrementQty,
    decrementQty,
    alreadyInCart,
  } = useProductCartLogic({ ...product, category }, 1);
  const v = useVertical();
  const { website } = useWebsiteContext();
  const [imgIndex, setImgIndex] = useState(0);

  if (!ready) return null;

  // Etiquetas del producto.
  const soldOut = isOutOfStock(product);
  const lowStock = !soldOut && colorStock > 0 && colorStock <= 5;
  const productTags = Array.isArray(product.tags) ? product.tags.slice(0, 3) : [];

  // Envío gratis (aprox. por el umbral nacional configurado por el dueño).
  const freeFrom = website?.company?.storeShipping?.shipping?.freeFrom ?? null;
  const freeShipping = freeFrom != null && product.price >= freeFrom;

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
  // AMPLIA y elegante (fila completa). Foto grande a la izquierda, información
  // con aire y, a la derecha, precio + selector de cantidad y botón de agregar.
  if (v.layout === "menu") {
    return (
      <article className="group flex gap-4 rounded-2xl border border-(--border-soft) bg-(--bg-page) p-4 transition-all hover:border-(--border-strong) hover:shadow-(--shadow-lg) sm:gap-5 sm:p-5">
        <Link
          href={`/${category}/${product.slug}`}
          className="relative h-28 w-28 flex-none overflow-hidden rounded-xl bg-(--bg-soft) sm:h-36 sm:w-36 md:h-40 md:w-40"
        >
          <ProductImage
            product={product}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              soldOut ? "opacity-45 grayscale" : ""
            }`}
          />
          {!soldOut && product.discount > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-(--danger) px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              -{product.discount}%
            </span>
          )}
          {soldOut && (
            <span className="absolute left-2 top-2 rounded-md bg-(--text-muted) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Agotado
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Nombre */}
          <Link href={`/${category}/${product.slug}`}>
            <h3 className="line-clamp-1 text-base font-semibold text-(--text-primary) transition group-hover:text-(--brand-accent) sm:text-lg">
              {product.name}
            </h3>
          </Link>

          {/* Rating + etiquetas */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {product.rating ? (
              <span className="flex items-center gap-1 text-xs text-(--text-muted)">
                <StarSolid className="h-3.5 w-3.5 text-(--brand-accent)" />
                <span className="font-medium text-(--text-secondary)">
                  {product.rating}
                </span>
              </span>
            ) : null}
            {productTags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-(--bg-muted) px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--brand-primary)"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Descripción (texto plano en el preview del menú) */}
          {product.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-(--text-muted)">
              {stripHtml(product.description)}
            </p>
          )}

          {/* Precio + acciones */}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
            <div className="flex flex-col">
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs line-through text-(--text-muted)">
                  ${product.oldPrice.toLocaleString()}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-(--text-primary)">
                  ${product.price.toLocaleString()}
                  {isWeight && (
                    <span className="text-xs font-medium text-(--text-muted)">
                      {" "}
                      /kg
                    </span>
                  )}
                </span>
                {product.discount > 0 && (
                  <span className="rounded bg-(--success) px-1.5 py-0.5 text-xs font-bold text-white">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {soldOut ? (
              <span className="rounded-lg bg-(--bg-muted) px-4 py-2 text-sm font-semibold text-(--text-muted)">
                Agotado
              </span>
            ) : (
              <div className="flex items-center gap-2">
                {/* Selector de cantidad */}
                <div className="flex items-center rounded-lg border border-(--border-soft)">
                  <button
                    type="button"
                    aria-label="Quitar uno"
                    onClick={decrementQty}
                    className="flex h-9 w-9 items-center justify-center text-(--text-secondary) transition hover:bg-(--bg-soft) cursor-pointer"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label="Agregar uno"
                    onClick={incrementQty}
                    className="flex h-9 w-9 items-center justify-center text-(--text-secondary) transition hover:bg-(--bg-soft) cursor-pointer"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex flex-none items-center gap-1 rounded-lg bg-(--cta-primary) px-4 py-2 text-sm font-semibold text-(--text-inverted) transition hover:bg-(--cta-primary-hover) cursor-pointer"
                >
                  {alreadyInCart ? "✔ Agregado" : v.addToCart}
                </button>
              </div>
            )}
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
    <article className="group flex flex-col overflow-hidden rounded-lg border border-(--border-soft) bg-(--bg-page) shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-(--border-strong) hover:shadow-(--shadow-lg)">
      {/* Imagen con galería en hover (cambiar fotos sin salir de la lista).
          La imagen va en ABSOLUTO dentro del cuadro cuadrado: el tamaño de la
          card no depende de la foto, así no "salta" al cambiar de imagen. */}
      <div className="relative aspect-square overflow-hidden bg-(--bg-page)">
        <Link href={`/${category}/${product.slug}`} className="absolute inset-0">
          {currentImg ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={currentImg}
              alt={product.name}
              className={`absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03] ${
                soldOut ? "opacity-45 grayscale" : ""
              }`}
            />
          ) : (
            <ProductImage
              product={product}
              className="absolute inset-0 h-full w-full object-contain p-4"
            />
          )}
        </Link>

        {/* Etiquetas sobre la imagen */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
          {soldOut && (
            <span className="rounded-md bg-(--text-muted) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Agotado
            </span>
          )}
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

      {/* Contenido (toda la tarjeta lleva al producto, estilo ML) */}
      <Link
        href={`/${category}/${product.slug}`}
        className="flex flex-1 flex-col gap-1 p-3 sm:p-4"
      >
        {/* Título liviano, 2 líneas */}
        <h3 className="line-clamp-2 min-h-9 text-sm text-(--text-secondary) transition group-hover:text-(--brand-accent)">
          {product.name}
        </h3>

        {/* Marca + verificado */}
        {product.brand && (
          <p className="flex items-center gap-1 text-xs text-(--text-muted)">
            {product.brand}
            <span className="text-(--brand-accent)">✓</span>
          </p>
        )}

        {/* Rating + vendidos */}
        {product.rating ? (
          <div className="flex items-center gap-1 text-xs text-(--text-muted)">
            <StarSolid className="h-3.5 w-3.5 text-(--brand-accent)" />
            <span className="font-medium text-(--text-secondary)">
              {product.rating}
            </span>
            {product.sold ? <span>| +{product.sold} vendidos</span> : null}
          </div>
        ) : null}

        {/* Precio anterior tachado */}
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="mt-0.5 text-xs text-(--text-muted) line-through">
            ${product.oldPrice.toLocaleString()}
          </span>
        )}
        {/* Precio de venta + % OFF (pill verde, estilo Mercado Libre) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-semibold text-(--text-primary) sm:text-2xl">
            ${product.price.toLocaleString()}
            {isWeight && (
              <span className="text-xs font-medium text-(--text-muted)"> /kg</span>
            )}
          </span>
          {product.discount > 0 && (
            <span className="rounded bg-(--success) px-1.5 py-0.5 text-xs font-bold text-white">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Envío gratis */}
        {freeShipping && (
          <span className="text-xs font-semibold text-(--success)">
            Envío gratis
          </span>
        )}

        {/* Estado en carrito */}
        {alreadyInCart && (
          <span className="mt-0.5 text-xs text-(--success)">✔ En tu carrito</span>
        )}
        {error && (
          <span className="text-xs font-medium text-(--danger)">{error}</span>
        )}
      </Link>
    </article>
  );
}
