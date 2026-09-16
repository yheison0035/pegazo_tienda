// cart/cartDrawerDesktop.jsx
"use client";

import { XMarkIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/context/cartContext";
import CartItem from "../cartItem";
import CartSummary from "../cartSummary";
import CartEmpty from "./cartEmpty";

export default function CartDrawerDesktop({ open, onClose }) {
  const { items } = useCart();
  const count = items.reduce((a, i) => a + i.quantity, 0);

  return (
    <>
      <div className="fixed inset-0 z-998 bg-black/40" onClick={onClose} />

      <aside className="animate-slide-in-right fixed right-0 top-0 z-999 flex h-dvh w-full max-w-md flex-col bg-(--bg-page) shadow-(--shadow-lg)">
        {/* Cabecera */}
        <div className="flex shrink-0 items-center justify-between border-b border-(--border-soft) p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-(--text-primary)">
            <ShoppingBagIcon className="h-5 w-5 text-(--brand-accent)" />
            Tu carrito
            {count > 0 && (
              <span className="rounded-full bg-(--brand-accent)/15 px-2 py-0.5 text-xs font-bold text-(--brand-accent)">
                {count}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-(--text-muted) transition hover:bg-(--bg-soft) cursor-pointer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Lista con scroll independiente (min-h-0 permite que encoja) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <CartEmpty onClose={onClose} />
          ) : (
            items.map((item) => (
              <CartItem key={item.key} item={item} onNavigate={onClose} />
            ))
          )}
        </div>

        {items.length > 0 && <CartSummary onClose={onClose} />}
      </aside>
    </>
  );
}
