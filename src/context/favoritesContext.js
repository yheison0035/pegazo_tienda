"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCustomer } from "./customerContext";
import {
  addFavorite as apiAddFavorite,
  getFavoriteIds,
  getFavorites as apiGetFavorites,
  removeFavorite as apiRemoveFavorite,
} from "@/lib/utils/api/routes/favorites";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useCustomer();
  const router = useRouter();
  const pathname = usePathname();

  // Set de IDs favoritos (para pintar el corazón en cualquier card).
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  // Lista completa de productos favoritos (para la página "Mis favoritos").
  const [favorites, setFavorites] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const listLoadedRef = useRef(false);

  // Al iniciar/cerrar sesión: cargar o limpiar los IDs favoritos.
  useEffect(() => {
    if (authLoading) return;
    let alive = true;
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      setFavorites([]);
      listLoadedRef.current = false;
      return;
    }
    (async () => {
      try {
        const res = await getFavoriteIds();
        if (alive) setFavoriteIds(new Set(res?.data || []));
      } catch {
        /* sesión sin favoritos o error silencioso */
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAuthenticated, authLoading]);

  const isFavorite = useCallback(
    (id) => favoriteIds.has(Number(id)),
    [favoriteIds],
  );

  // Carga la lista completa de favoritos (con datos de card). Se usa en la
  // página/pestaña "Mis favoritos".
  const loadFavorites = useCallback(async (force = false) => {
    if (listLoadedRef.current && !force) return;
    setListLoading(true);
    try {
      const res = await apiGetFavorites();
      setFavorites(res?.data || []);
      listLoadedRef.current = true;
    } catch {
      setFavorites([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  /**
   * Alterna el favorito de un producto.
   * - Si el cliente NO está logueado, lo enviamos a iniciar sesión.
   * - Si está logueado, actualización optimista + llamada al backend.
   */
  const toggleFavorite = useCallback(
    async (product) => {
      const id = Number(product?.id ?? product);
      if (!id) return;

      if (!isAuthenticated) {
        // Recordamos a dónde volver tras iniciar sesión.
        const back = encodeURIComponent(pathname || "/");
        router.push(`/mi-cuenta?favorito=1&redirect=${back}`);
        return;
      }

      const currentlyFav = favoriteIds.has(id);

      // Optimista: reflejamos el cambio de inmediato.
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (currentlyFav) next.delete(id);
        else next.add(id);
        return next;
      });

      // Mantener la lista completa en sincronía si ya está cargada.
      if (currentlyFav) {
        setFavorites((prev) => prev.filter((p) => Number(p.id) !== id));
      }

      try {
        if (currentlyFav) await apiRemoveFavorite(id);
        else {
          await apiAddFavorite(id);
          // Si la lista completa ya se mostró, la refrescamos para incluirlo.
          if (listLoadedRef.current) await loadFavorites(true);
        }
      } catch {
        // Revertir en caso de error.
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (currentlyFav) next.add(id);
          else next.delete(id);
          return next;
        });
        if (listLoadedRef.current) loadFavorites(true);
      }
    },
    [isAuthenticated, favoriteIds, pathname, router, loadFavorites],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favorites,
        listLoading,
        isFavorite,
        toggleFavorite,
        loadFavorites,
        count: favoriteIds.size,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  }
  return ctx;
}
