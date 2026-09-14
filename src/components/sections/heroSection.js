"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useWebsiteContext } from "@/context/websiteContext";
import { getCompanyName } from "@/lib/website";

/**
 * Portada de la tienda: banners que la empresa sube desde el CRM y, si no hay,
 * el título/subtítulo configurados. Diseño estilo tiendas grandes: banda a todo
 * el ancho, altura controlada, imagen COMPLETA sobre un fondo desenfocado (llena
 * la banda sin recortar), flechas y puntos.
 */
export default function HeroSection() {
  const { website } = useWebsiteContext();
  const company = website?.company;

  const banners = (website?.banners || []).filter(
    (banner) => banner.active !== false && banner.type === "HOME",
  );

  const [current, setCurrent] = useState(0);

  // Auto-cambio pausado (9s) y solo si hay más de un banner.
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((index) => (index + 1) % banners.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length > 0) {
    const total = banners.length;
    const banner = banners[Math.min(current, total - 1)];
    const go = (dir) => setCurrent((i) => (i + dir + total) % total);

    return (
      <section className="relative w-full overflow-hidden bg-(--bg-muted)">
        {/* Banda de altura controlada, a todo el ancho (tamaño promedio de
            tiendas grandes: ~480-540px en desktop). */}
        <div className="relative h-56 w-full sm:h-72 md:h-[26rem] lg:h-[30rem] xl:h-[34rem]">
          {/* Fondo desenfocado (rellena la banda sin barras vacías). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
          />
          <div className="absolute inset-0 bg-black/10" />

          {/* Imagen COMPLETA (sin recortar), ajustada a la banda en cualquier
              pantalla (object-contain rellena con el fondo desenfocado). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.image}
            alt={banner.title || getCompanyName(website)}
            className="absolute inset-0 z-10 h-full w-full object-contain"
          />

          {(banner.title || banner.subtitle || banner.buttonText) && (
            <div className="absolute inset-0 z-20 flex flex-col justify-center gap-3 bg-gradient-to-r from-black/60 via-black/20 to-transparent px-4 sm:px-8 md:px-16">
              {banner.title && (
                <h2 className="max-w-xl text-xl font-bold text-(--text-inverted) drop-shadow sm:text-2xl md:text-4xl">
                  {banner.title}
                </h2>
              )}
              {banner.subtitle && (
                <p className="max-w-lg text-xs text-(--text-inverted)/90 drop-shadow sm:text-sm md:text-base">
                  {banner.subtitle}
                </p>
              )}
              {banner.buttonText && banner.buttonUrl && (
                <Link
                  href={banner.buttonUrl}
                  className="w-fit rounded-(--radius-md) bg-(--cta-primary) px-5 py-2.5 text-sm font-medium text-(--text-inverted) transition hover:opacity-90"
                >
                  {banner.buttonText}
                </Link>
              )}
            </div>
          )}

          {/* Flechas */}
          {total > 1 && (
            <>
              <button
                type="button"
                aria-label="Banner anterior"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-(--bg-page)/85 text-(--text-primary) shadow transition hover:bg-(--bg-page)"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Banner siguiente"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-(--bg-page)/85 text-(--text-primary) shadow transition hover:bg-(--bg-page)"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Puntos */}
          {total > 1 && (
            <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-2">
              {banners.map((item, index) => (
                <button
                  key={item.id ?? index}
                  type="button"
                  aria-label={`Ir al banner ${index + 1}`}
                  onClick={() => setCurrent(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === current
                      ? "w-6 bg-(--cta-primary)"
                      : "w-2 bg-(--bg-page)/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (!company?.heroTitle && !company?.heroSubtitle) return null;

  return (
    <section className="bg-(--brand-primary) px-6 py-12 text-center md:px-12 md:py-16">
      {company.heroTitle && (
        <h2 className="text-2xl font-bold text-(--text-inverted) md:text-4xl">
          {company.heroTitle}
        </h2>
      )}
      {company.heroSubtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-sm text-(--text-inverted)/80 md:text-base">
          {company.heroSubtitle}
        </p>
      )}
    </section>
  );
}
