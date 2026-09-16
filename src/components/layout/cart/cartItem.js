"use client";

import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/context/cartContext";
import ProductImage from "@/components/ui/productImage";
import { getColorHexByName } from "@/utils/getColor";
import Link from "next/link";

export default function CartItem({ item, onNavigate }) {
  const { updateItemQuantity, removeFromCart } = useCart();

  const isLowStock = item.stock <= 3;
  const lineTotal = item.price * item.quantity;

  function increase() {
    if (item.quantity < item.stock) {
      updateItemQuantity(item.key, item.quantity + 1);
    }
  }

  function decrease() {
    if (item.quantity > 1) {
      updateItemQuantity(item.key, item.quantity - 1);
    } else {
      removeFromCart(item.key);
    }
  }

  return (
    <div className="flex gap-3 border-b border-(--border-soft) py-4 last:border-0">
      {/* Imagen */}
      <Link
        href={`/${item.category}/${item.slug}`}
        onClick={onNavigate}
        className="h-[68px] w-[68px] flex-none overflow-hidden rounded-xl border border-(--border-soft) bg-(--bg-soft)"
      >
        <ProductImage
          product={item}
          compact
          className="h-full w-full object-contain p-1"
        />
      </Link>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/${item.category}/${item.slug}`}
            onClick={onNavigate}
            className="min-w-0"
          >
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-(--text-primary) transition hover:text-(--brand-accent)">
              {item.name}
            </p>
          </Link>
          <button
            onClick={() => removeFromCart(item.key)}
            title="Eliminar producto"
            aria-label="Eliminar producto"
            className="-mr-1 -mt-1 flex-none rounded-lg p-1.5 text-(--text-muted) transition hover:bg-(--danger)/10 hover:text-(--danger) cursor-pointer"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        {item.color && (
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-(--text-muted)">
            <span
              className="h-3 w-3 rounded-full border border-(--border-strong)"
              style={{ backgroundColor: getColorHexByName(item.color) }}
            />
            <span className="capitalize">{item.color}</span>
          </div>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-bold text-(--text-primary)">
            ${item.price.toLocaleString()}
          </span>
          {item.oldPrice && item.oldPrice > item.price && (
            <span className="text-xs text-(--text-muted) line-through">
              ${item.oldPrice.toLocaleString()}
            </span>
          )}
          {item.discount > 0 && (
            <span className="rounded-md bg-(--success)/15 px-1.5 py-0.5 text-[10px] font-bold text-(--success)">
              -{item.discount}%
            </span>
          )}
        </div>

        {isLowStock && (
          <p className="mt-0.5 text-[11px] font-medium text-(--warning)">
            ¡Solo quedan {item.stock}!
          </p>
        )}

        {/* Cantidad + total de la línea */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-(--border-soft)">
            <button
              onClick={decrease}
              aria-label="Quitar uno"
              className="flex h-8 w-8 items-center justify-center text-(--text-secondary) transition hover:bg-(--bg-soft) cursor-pointer"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">
              {item.quantity}
            </span>
            <button
              onClick={increase}
              disabled={item.quantity >= item.stock}
              aria-label="Agregar uno"
              className="flex h-8 w-8 items-center justify-center text-(--text-secondary) transition hover:bg-(--bg-soft) disabled:opacity-40 cursor-pointer"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <span className="text-sm font-bold text-(--text-primary)">
            ${lineTotal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
