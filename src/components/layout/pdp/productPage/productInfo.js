"use client";

import useProductCartLogic from "@/hooks/useProductCartLogic";
import useVertical from "@/hooks/useVertical";
import { useWebsiteContext } from "@/context/websiteContext";
import { getColorHexByName } from "@/utils/getColor";
import {
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

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
    actionLabel,
    alreadyInCart,
  } = useProductCartLogic({ ...product, category }, 1);
  const v = useVertical();
  const { website } = useWebsiteContext();

  if (!ready) return null;

  // Umbral de envío gratis: el configurado por el dueño (envío nacional) o el
  // legado si no configuró envíos.
  const shipCfg = website?.company?.storeShipping?.shipping;
  const freeFrom = shipCfg?.freeFrom ?? FREE_SHIPPING_FROM;
  const freeShipping = freeFrom != null && product.price * qty >= freeFrom;

  const savings =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice - product.price
      : 0;

  return (
    <div
      className="
        bg-white
        border border-(--border-soft)
        rounded-2xl
        p-4 sm:p-6
        space-y-5
        shadow-(--shadow-sm)
        max-w-full
      "
    >
      <h1 className="text-base sm:text-xl font-semibold text-(--text-primary)">
        {product.name}
      </h1>

      {/* Etiquetas */}
      {(product.discount > 0 || (colorStock > 0 && colorStock <= 5)) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {product.discount > 0 && (
            <span className="rounded-md bg-(--bg-muted) px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-(--cta-primary)">
              Oferta -{product.discount}%
            </span>
          )}
          {colorStock > 0 && colorStock <= 5 && (
            <span className="rounded-md bg-(--bg-muted) px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-(--warning)">
              Últimas unidades
            </span>
          )}
        </div>
      )}

      {/* Precio: Antes (tachado) y Ahora (grande) + ahorro */}
      <div className="space-y-0.5">
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="block text-sm text-(--text-muted) line-through">
            Antes ${product.oldPrice.toLocaleString()}
          </span>
        )}
        <div className="flex items-end gap-3 flex-wrap">
          <span className="text-2xl sm:text-3xl font-bold text-(--text-primary)">
            ${product.price.toLocaleString()}
            {isWeight && (
              <span className="text-base font-medium text-(--text-muted)"> / kg</span>
            )}
          </span>
        </div>
        {savings > 0 && (
          <span className="block text-sm font-semibold text-(--success)">
            Ahorras ${savings.toLocaleString()}
          </span>
        )}
      </div>

      {v.fulfillment.includes("shipping") && freeFrom != null && (
        <div className="flex items-center gap-2 text-sm">
          <TruckIcon className="w-5 h-5" />
          <span
            className={freeShipping ? "text-(--success)" : "text-(--text-muted)"}
          >
            {freeShipping
              ? "Envío gratis"
              : `Envío gratis desde $${freeFrom.toLocaleString()}`}
          </span>
        </div>
      )}

      {v.warrantyBadge && (
        <div className="flex items-center gap-2 text-xs text-(--text-muted)">
          <ShieldCheckIcon className="w-4 h-4 text-(--success)" />
          Compra segura · Garantía incluida
        </div>
      )}

      {hasColors && (
        <div>
          <p className="text-sm font-medium mb-2">Color</p>
          <div className="flex gap-3 flex-wrap">
            {colorOptions.map((c) => (
              <button
                key={c.name}
                onClick={() => selectColor(c)}
                title={c.name}
                className={`
                  w-8 h-8 rounded-full border
                  transition cursor-pointer
                  ${
                    selectedColor === c.name
                      ? "border-(--brand-accent) ring-2 ring-(--brand-accent)"
                      : "border-(--border-soft)"
                  }
                `}
                style={{ backgroundColor: getColorHexByName(c.name) }}
              />
            ))}
          </div>
        </div>
      )}

      {hasSize && (
        <div>
          <p className="text-sm font-medium mb-2">Talla</p>
          <div className="flex gap-2 flex-wrap">
            {sizeOptions.map((s) => (
              <button
                key={s}
                onClick={() => selectSize(s)}
                className={`
                  min-w-10 rounded-lg border px-3 py-1.5 text-sm font-medium
                  transition cursor-pointer
                  ${
                    selectedSize === s
                      ? "border-(--cta-primary) bg-(--bg-soft) text-(--text-primary)"
                      : "border-(--border-soft) text-(--text-muted) hover:bg-(--bg-soft)"
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-2">
          {isWeight ? "Cantidad (kg)" : "Cantidad"}
        </p>
        <div className="inline-flex items-center border rounded-xl">
          <button onClick={decrementQty} className="p-3 cursor-pointer">
            <MinusIcon className="w-4 h-4" />
          </button>
          <span className="px-4 font-semibold">{qty}</span>
          <button
            onClick={incrementQty}
            disabled={qty >= colorStock}
            className="p-3 disabled:opacity-40 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="min-h-8 flex flex-col justify-center">
        {selectedColor && colorStock <= 5 && (
          <p className="text-xs text-(--warning)">¡Solo quedan {colorStock}!</p>
        )}

        {selectedColor && (
          <p className="text-xs text-(--text-muted)">
            Stock {selectedColor}: {colorStock}
          </p>
        )}

        {alreadyInCart && (
          <p className="text-xs text-(--success)">
            ✔ Ya tienes {qty} en tu carrito
          </p>
        )}

        {error && (
          <p className="text-xs text-(--danger) font-medium">{error}</p>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={handleAddToCart}
          className="
            w-full
            bg-(--cta-primary)
            hover:bg-(--cta-primary-hover)
            text-white
            py-4
            rounded-xl
            font-semibold
            flex items-center justify-center gap-2 cursor-pointer
          "
        >
          <ShoppingCartIcon className="w-5 h-5" />
          {alreadyInCart ? actionLabel : v.addToCart}
        </button>

        <button
          className="
            w-full
            border border-(--border-soft)
            py-4
            rounded-xl
            font-semibold
            hover:bg-(--bg-soft) cursor-pointer
          "
        >
          {v.buyNow}
        </button>
      </div>
    </div>
  );
}
