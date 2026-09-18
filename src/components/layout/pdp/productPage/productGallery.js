"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from "@heroicons/react/24/outline";
import ProductImage from "@/components/ui/productImage";

const MAX_ZOOM = 4;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Galería de la PDP. La imagen principal vive en una caja de RELACIÓN FIJA
 * (aspect-square) con object-contain. Al hacer clic se abre un lightbox a
 * pantalla completa CON ZOOM: pellizco en móvil, rueda del mouse y doble clic
 * en desktop, y arrastrar para desplazar la imagen ampliada.
 */
export default function ProductGallery({ images = [] }) {
  const safeImages = Array.isArray(images) ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Zoom / desplazamiento del lightbox.
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [moving, setMoving] = useState(false);
  const gesture = useRef({});

  const total = safeImages.length;
  const active = safeImages[Math.min(activeIndex, Math.max(total - 1, 0))];

  const go = useCallback(
    (dir) => setActiveIndex((i) => (i + dir + total) % total),
    [total],
  );

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Al cambiar de imagen o abrir/cerrar el lightbox, se resetea el zoom.
  useEffect(() => {
    resetZoom();
  }, [activeIndex, lightbox, resetZoom]);

  // Teclado en el lightbox: Esc cierra, flechas cambian.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, go]);

  // ---- Zoom con rueda (desktop) ----
  const onWheel = (e) => {
    const next = clamp(zoom * (e.deltaY < 0 ? 1.2 : 1 / 1.2), 1, MAX_ZOOM);
    if (next === 1) resetZoom();
    else setZoom(Number(next.toFixed(3)));
  };

  // ---- Doble clic: alterna entre 1x y 2.5x ----
  const toggleZoom = () => (zoom > 1 ? resetZoom() : setZoom(2.5));

  const stepZoom = (factor) => {
    const next = clamp(zoom * factor, 1, MAX_ZOOM);
    if (next === 1) resetZoom();
    else setZoom(Number(next.toFixed(3)));
  };

  // ---- Arrastrar con mouse (desktop) cuando hay zoom ----
  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setMoving(true);
    gesture.current.pan = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onMouseMove = (e) => {
    const g = gesture.current.pan;
    if (!g) return;
    setPan({ x: g.px + (e.clientX - g.x), y: g.py + (e.clientY - g.y) });
  };
  const endMouse = () => {
    gesture.current.pan = null;
    setMoving(false);
  };

  // ---- Táctil: 1 dedo = swipe (sin zoom) o mover (con zoom); 2 dedos = pellizco ----
  const dist = (t) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      setMoving(true);
      gesture.current = { pinch: { d: dist(e.touches), z: zoom } };
    } else if (e.touches.length === 1) {
      if (zoom > 1) {
        setMoving(true);
        gesture.current = {
          pan: {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            px: pan.x,
            py: pan.y,
          },
        };
      } else {
        gesture.current = { swipe: e.touches[0].clientX };
      }
    }
  };

  const onTouchMove = (e) => {
    const g = gesture.current;
    if (g.pinch && e.touches.length === 2) {
      const ratio = dist(e.touches) / g.pinch.d;
      const next = clamp(g.pinch.z * ratio, 1, MAX_ZOOM);
      setZoom(Number(next.toFixed(3)));
    } else if (g.pan && e.touches.length === 1) {
      setPan({
        x: g.pan.px + (e.touches[0].clientX - g.pan.x),
        y: g.pan.py + (e.touches[0].clientY - g.pan.y),
      });
    }
  };

  const onTouchEnd = (e) => {
    const g = gesture.current;
    // Cambiar de imagen con swipe solo si NO hay zoom.
    if (g.swipe != null && total > 1 && zoom <= 1) {
      const dx = e.changedTouches[0].clientX - g.swipe;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    }
    if (zoom <= 1) setPan({ x: 0, y: 0 });
    gesture.current = {};
    setMoving(false);
  };

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

      {/* Lightbox a pantalla completa con ZOOM */}
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

          {total > 1 && zoom <= 1 && (
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

          {/* Área de imagen: captura los gestos de zoom/desplazamiento */}
          <div
            className="relative h-full w-full max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={toggleZoom}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={endMouse}
            onMouseLeave={endMouse}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              touchAction: "none",
              cursor: zoom > 1 ? (moving ? "grabbing" : "grab") : "zoom-in",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: moving ? "none" : "transform 0.15s ease-out",
                willChange: "transform",
              }}
            >
              <Image
                src={active}
                alt="Imagen ampliada del producto"
                fill
                sizes="100vw"
                unoptimized
                draggable={false}
                className="select-none object-contain"
              />
            </div>
          </div>

          {/* Controles de zoom (útiles en desktop; en móvil también sirven) */}
          <div
            className="absolute bottom-4 left-4 z-10 flex items-center gap-1 rounded-full bg-black/50 p-1 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Alejar"
              onClick={() => stepZoom(1 / 1.4)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
            >
              <MagnifyingGlassMinusIcon className="h-5 w-5" />
            </button>
            <span className="min-w-10 text-center text-xs font-medium text-white">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              aria-label="Acercar"
              onClick={() => stepZoom(1.4)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
            >
              <MagnifyingGlassPlusIcon className="h-5 w-5" />
            </button>
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
