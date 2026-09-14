"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline";
import ProductImage from "@/components/ui/productImage";

/**
 * Galería de la PDP. La imagen principal vive en una caja de RELACIÓN FIJA
 * (aspect-square) con object-contain, para que TODAS las imágenes ocupen el
 * mismo espacio y no "salte" el tamaño al cambiar de una a otra. Al hacer clic
 * se abre un lightbox a pantalla completa (móvil y desktop) para ver el detalle.
 */
export default function ProductGallery({ images = [] }) {
  const safeImages = Array.isArray(images) ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const total = safeImages.length;
  const active = safeImages[Math.min(activeIndex, Math.max(total - 1, 0))];

  const go = useCallback(
    (dir) => setActiveIndex((i) => (i + dir + total) % total),
    [total],
  );

  // Swipe con el dedo dentro del lightbox (móvil).
  const lbTouchX = useRef(null);
  const onLbTouchStart = (e) => {
    lbTouchX.current = e.touches[0].clientX;
  };
  const onLbTouchEnd = (e) => {
    if (lbTouchX.current == null || total < 2) return;
    const dx = e.changedTouches[0].clientX - lbTouchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    lbTouchX.current = null;
  };

  // Teclado en el lightbox: Esc cierra, flechas cambian.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    // Evita el scroll del fondo mientras el lightbox está abierto.
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, go]);

  if (!total) {
    return (
      <div className="aspect-square border border-(--border-soft) rounded-2xl overflow-hidden">
        <ProductImage product={null} alt="Producto" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Miniaturas */}
        {total > 1 && (
          <div className="flex lg:flex-col gap-2 order-2 lg:order-1 overflow-x-auto lg:overflow-visible">
            {safeImages.map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                aria-label={`Ver imagen ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={`relative shrink-0 w-16 h-16 rounded-lg border overflow-hidden cursor-pointer bg-white ${
                  i === activeIndex
                    ? "border-(--brand-accent) ring-1 ring-(--brand-accent)"
                    : "border-(--border-soft)"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}

        {/* Imagen principal: caja de relación FIJA + clic para ampliar */}
        <div className="order-1 lg:order-2 flex-1">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Ampliar imagen"
            className="group relative block w-full aspect-square bg-white border border-(--border-soft) rounded-2xl overflow-hidden cursor-zoom-in"
          >
            <Image
              src={active}
              alt="Imagen del producto"
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              priority
              unoptimized
              className="object-contain transition-transform duration-300 lg:group-hover:scale-110"
            />
            <span className="absolute bottom-3 right-3 flex items-center gap-1 text-xs bg-black/60 text-white px-2 py-1 rounded">
              <MagnifyingGlassPlusIcon className="h-4 w-4" />
              Toca para ampliar
            </span>
          </button>
        </div>
      </div>

      {/* Lightbox a pantalla completa (móvil y desktop) */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm hover:bg-black/70"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                aria-label="Imagen anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm hover:bg-black/70 sm:flex"
              >
                <ChevronLeftIcon className="h-7 w-7" />
              </button>
              <button
                type="button"
                aria-label="Imagen siguiente"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm hover:bg-black/70 sm:flex"
              >
                <ChevronRightIcon className="h-7 w-7" />
              </button>
            </>
          )}

          {/* La imagen grande: no cierra al tocarla y se cambia con el dedo */}
          <div
            className="relative h-full w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onLbTouchStart}
            onTouchEnd={onLbTouchEnd}
            style={{ touchAction: "pan-y" }}
          >
            <Image
              src={active}
              alt="Imagen ampliada del producto"
              fill
              sizes="100vw"
              unoptimized
              className="object-contain"
            />
          </div>

          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
              {activeIndex + 1} / {total}
            </div>
          )}
        </div>
      )}
    </>
  );
}
