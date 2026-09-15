"use client";

import { useState } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useFavorites } from "@/context/favoritesContext";

/**
 * Corazón para marcar/desmarcar un producto como favorito.
 * - Si el cliente no ha iniciado sesión, el contexto lo redirige al login.
 * - Va dentro de un <Link> (cards), por eso frena la propagación del clic.
 *
 * variant: "overlay" (flotante sobre la imagen, cards) | "inline" (en la PDP).
 */
export default function FavoriteButton({ product, variant = "overlay", className = "" }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [pulse, setPulse] = useState(false);
  const active = isFavorite(product?.id);

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPulse(true);
    setTimeout(() => setPulse(false), 260);
    toggleFavorite(product);
  };

  const base =
    "group/fav z-30 flex items-center justify-center rounded-full transition cursor-pointer";
  const sizing =
    variant === "inline"
      ? "h-11 w-11 border border-(--border-soft) bg-(--bg-page) hover:border-(--danger) shadow-sm"
      : "absolute right-2 top-2 h-9 w-9 bg-(--bg-page)/90 shadow hover:bg-(--bg-page)";

  const Icon = active ? HeartSolid : HeartOutline;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      title={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`${base} ${sizing} ${className}`}
    >
      <Icon
        className={`h-5 w-5 transition ${
          active
            ? "text-(--danger)"
            : "text-(--text-muted) group-hover/fav:text-(--danger)"
        } ${pulse ? "scale-125" : "scale-100"}`}
      />
    </button>
  );
}
