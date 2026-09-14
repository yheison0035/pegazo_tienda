"use client";

import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/context/cartContext";
import ProductImage from "@/components/ui/productImage";
import { getColorHexByName } from "@/utils/getColor";
import Link from "next/link";

export default function CartItem({ item }) {
  const { updateItemQuantity, removeFromCart } = useCart();

  const isLowStock = item.stock <= 3;


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
    <div className="flex gap-4 py-5 border-b border-(--border-soft)">
      <Link
        href={`/${item.category}/${item.slug}`}
        className="
          w-20 h-20
          rounded-xl
          flex items-center justify-center
          overflow-hidden
          bg-(--bg-soft)
          shrink-0
        "
      >
        <ProductImage
          product={item}
          compact
          className="w-full h-full object-contain"
        />
      </Link>

      <div className="flex-1 flex flex-col gap-1">
        <Link href={`/${item.category}/${item.slug}`}>
          <p className="font-semibold text-sm text-(--text-primary) leading-tight hover:underline">
            {item.name}
          </p>
        </Link>

        {item.color && (
          <div className="flex items-center gap-2 text-xs text-(--text-muted)">
            <span>Color:</span>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full border border-(--border-strong)"
                style={{ backgroundColor: getColorHexByName(item.color) }}
              />
              <span className="capitalize">{item.color}</span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.oldPrice && item.oldPrice > item.price && (
            <span className="text-xs text-(--text-muted) line-through">
              ${item.oldPrice.toLocaleString()}
            </span>
          )}

          <span className="text-sm font-bold text-(--text-primary)">
            ${item.price.toLocaleString()}
          </span>

          {item.discount > 0 && (
            <span className="rounded-md bg-(--bg-muted) px-1.5 py-0.5 text-[10px] font-bold text-(--cta-primary)">
              -{item.discount}%
            </span>
          )}
        </div>

        <p
          className={`text-xs mt-1 ${
            isLowStock ? "text-(--warning)" : "text-(--text-muted)"
          }`}
        >
          {isLowStock
            ? `¡Solo quedan ${item.stock}!`
            : `Stock disponible: ${item.stock}`}
        </p>

        <div className="flex items-center mt-3">
          <div className="flex items-center border border-(--border-soft) rounded-lg overflow-hidden">
            <button
              onClick={decrease}
              className="px-2 py-1 hover:bg-(--bg-soft) cursor-pointer"
            >
              <MinusIcon className="w-4 h-4" />
            </button>

            <span className="px-3 text-sm font-medium min-w-8 text-center">
              {item.quantity}
            </span>

            <button
              onClick={increase}
              disabled={item.quantity >= item.stock}
              className="px-2 py-1 hover:bg-(--bg-soft) disabled:opacity-40 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <span className="text-sm font-bold text-(--text-primary)">
          ${(item.price * item.quantity).toLocaleString()}
        </span>

        <button
          onClick={() => removeFromCart(item.key)}
          title="Eliminar producto"
          className="text-(--text-muted) hover:text-(--danger) transition cursor-pointer"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
