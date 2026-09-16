// cart/cartDrawerMobile.jsx
"use client";

import { XMarkIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/context/cartContext";
import CartItem from "../cartItem";
import CartSummary from "../cartSummary";
import CartEmpty from "./cartEmpty";

export default function CartDrawerMobile({ open, onClose }) {
  const { items } = useCart();
  const count = items.reduce((a, i) => a + i.quantity, 0);

  return (
    <>
      <div className="fixed inset-0 z-998 bg-black/50" onClick={onClose} />

      <aside
        className="animate-slide-up fixed inset-x-0 bottom-0 z-999 flex max-h-[92dvh] flex-col rounded-t-2xl bg-(--bg-page) shadow-2xl"
      >
        {/* Asa para arrastrar */}
        <div className="flex shrink-0 justify-center pt-2.5 pb-1">
          <div className="h-1.5 w-10 rounded-full bg-(--border-strong)" />
        </div>

        {/* Cabecera */}
        <div className="flex shrink-0 items-center justify-between border-b border-(--border-soft) px-4 pb-3">
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

        {/* Lista (scroll independiente): min-h-0 es clave para que el footer
            no se salga de la pantalla cuando hay varios productos. */}
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
