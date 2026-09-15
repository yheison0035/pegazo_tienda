"use client";

import { useRouter } from "next/navigation";
import useProductCartLogic from "@/hooks/useProductCartLogic";
import useVertical from "@/hooks/useVertical";
import { useWebsiteContext } from "@/context/websiteContext";
import { useFavorites } from "@/context/favoritesContext";
import { getColorHexByName } from "@/utils/getColor";
import {
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

// Umbral legado de envío gratis (solo si la empresa NO configuró envíos).
const FREE_SHIPPING_FROM = 100000;

export default function ProductInfo({ product, category }) {
  const {
    ready,
    hasColors,
    hasSize,
    colorOptions,
    sizeOptions,
    selectedColor,
    selectedSize,
    selectSize,
    colorStock,
    isWeight,
    qty,
    error,
    selectColor,
    incrementQty,
    decrementQty,
    handleAddToCart,
    alreadyInCart,
  } = useProductCartLogic({ ...product, category }, 1);
  const v = useVertical();
  const { website } = useWebsiteContext();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  const fav = isFavorite(product?.id);

  if (!ready) return null;

  const shipCfg = website?.company?.storeShipping?.shipping;
  const freeFrom = shipCfg?.freeFrom ?? FREE_SHIPPING_FROM;
  const freeShipping = freeFrom != null && product.price * qty >= freeFrom;
  const savings =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice - product.price
      : 0;
  const lowStock = colorStock > 0 && colorStock <= 5;

  const buyNow = () => {
    if (handleAddToCart()) router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* ---------- Info (centro) ---------- */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Etiquetas */}
        {(product.discount > 0 || lowStock) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {product.discount > 0 && (
              <span className="rounded-md bg-(--cta-primary) px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                Oferta -{product.discount}%
              </span>
            )}
            {lowStock && (
              <span className="rounded-md bg-(--warning) px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                ¡Últimas {colorStock}!
              </span>
            )}
          </div>
        )}

        <h1 className="text-lg sm:text-2xl font-semibold text-(--text-primary)">
          {product.name}
        </h1>

        {/* Precio: Antes (tachado) / Ahora (grande) + % OFF + ahorro */}
        <div className="space-y-0.5">
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="block text-sm text-(--text-muted) line-through">
              ${product.oldPrice.toLocaleString()}
            </span>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl font-bold text-(--text-primary)">
              ${product.price.toLocaleString()}
              {isWeight && (
                <span className="text-base font-medium text-(--text-muted)"> / kg</span>
              )}
            </span>
            {product.discount > 0 && (
              <span className="text-base font-semibold text-(--success)">
                {product.discount}% OFF
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className="block text-sm font-semibold text-(--success)">
              Ahorras ${savings.toLocaleString()}
            </span>
          )}
        </div>

        {hasColors && (
          <div>
            <p className="mb-2 text-sm font-medium text-(--text-primary)">Color</p>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((c) => (
                <button
                  key={c.name}
                  onClick={() => selectColor(c)}
                  title={c.name}
                  className={`h-8 w-8 rounded-full border transition cursor-pointer ${
                    selectedColor === c.name
                      ? "border-(--brand-accent) ring-2 ring-(--brand-accent)"
                      : "border-(--border-soft)"
                  }`}
                  style={{ backgroundColor: getColorHexByName(c.name) }}
                />
              ))}
            </div>
          </div>
        )}

        {hasSize && (
          <div>
            <p className="mb-2 text-sm font-medium text-(--text-primary)">Talla</p>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => selectSize(s)}
                  className={`min-w-10 rounded-lg border px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                    selectedSize === s
                      ? "border-(--cta-primary) bg-(--bg-soft) text-(--text-primary)"
                      : "border-(--border-soft) text-(--text-muted) hover:bg-(--bg-soft)"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------- Caja de compra (derecha, estilo Mercado Libre) ---------- */}
      <aside className="w-full lg:w-80 lg:flex-none lg:sticky lg:top-24">
        <div className="rounded-2xl border border-(--border-soft) bg-(--bg-page) p-4 shadow-(--shadow-sm) space-y-4">
          {v.fulfillment.includes("shipping") && freeFrom != null && (
            <div className="flex items-start gap-2 text-sm">
              <TruckIcon className="h-5 w-5 flex-none text-(--success)" />
              <span className={freeShipping ? "text-(--success) font-medium" : "text-(--text-muted)"}>
                {freeShipping
                  ? "Envío gratis"
                  : `Envío gratis desde $${freeFrom.toLocaleString()}`}
              </span>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-(--text-primary)">
              {colorStock > 0 ? "Stock disponible" : "Sin stock"}
            </p>
            {colorStock > 0 && (
              <p className={`text-xs ${lowStock ? "text-(--warning)" : "text-(--text-muted)"}`}>
                {lowStock
                  ? `¡Solo quedan ${colorStock}!`
                  : `${colorStock} unidades`}
              </p>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <p className="mb-1 text-xs font-medium text-(--text-muted)">
              {isWeight ? "Cantidad (kg)" : "Cantidad"}
            </p>
            <div className="inline-flex items-center rounded-xl border border-(--border-soft)">
              <button onClick={decrementQty} className="p-3 cursor-pointer" aria-label="Disminuir">
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="px-4 font-semibold">{qty}</span>
              <button
                onClick={incrementQty}
                disabled={qty >= colorStock}
                className="p-3 disabled:opacity-40 cursor-pointer"
                aria-label="Aumentar"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {alreadyInCart && (
            <p className="text-xs text-(--success)">✔ Ya está en tu carrito</p>
          )}
          {error && <p className="text-xs font-medium text-(--danger)">{error}</p>}

          {/* Acciones */}
          <div className="space-y-2 pt-1">
            <button
              onClick={buyNow}
              className="w-full rounded-xl bg-(--cta-primary) py-3 font-semibold text-white transition hover:bg-(--cta-primary-hover) cursor-pointer"
            >
              {v.buyNow}
            </button>
            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--cta-primary) py-3 font-semibold text-(--cta-primary) transition hover:bg-(--bg-soft) cursor-pointer"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {v.addToCart}
            </button>
            <button
              onClick={() => toggleFavorite(product)}
              aria-pressed={fav}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition cursor-pointer ${
                fav
                  ? "text-(--danger) hover:bg-(--danger)/10"
                  : "text-(--text-muted) hover:bg-(--bg-soft)"
              }`}
            >
              {fav ? (
                <HeartSolid className="h-5 w-5 text-(--danger)" />
              ) : (
                <HeartOutline className="h-5 w-5" />
              )}
              {fav ? "En tus favoritos" : "Agregar a favoritos"}
            </button>
          </div>

          {v.warrantyBadge && (
            <div className="flex items-center gap-2 border-t border-(--border-soft) pt-3 text-xs text-(--text-muted)">
              <ShieldCheckIcon className="h-4 w-4 text-(--success)" />
              Compra segura · Garantía incluida
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
