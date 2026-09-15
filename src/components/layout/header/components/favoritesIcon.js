"use client";

import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { useCustomer } from "@/context/customerContext";
import { useFavorites } from "@/context/favoritesContext";

// Acceso rápido a "Mis favoritos". Solo se muestra cuando el cliente inició
// sesión (los favoritos se guardan en su cuenta).
export default function FavoritesIcon() {
  const { isAuthenticated } = useCustomer();
  const { count } = useFavorites();

  if (!isAuthenticated) return null;

  return (
    <Link
      href="/mi-cuenta?tab=favoritos"
      aria-label="Mis favoritos"
      title="Mis favoritos"
      className="group relative flex cursor-pointer items-center rounded-full p-2 text-(--text-primary) transition hover:bg-(--brand-accent)/10 hover:text-(--brand-accent)"
    >
      <HeartIcon className="h-6 w-6 transition group-hover:scale-110" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-(--danger) text-xs text-white shadow">
          {count}
        </span>
      )}
    </Link>
  );
}
