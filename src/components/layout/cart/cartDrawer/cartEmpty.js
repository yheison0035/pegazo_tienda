"use client";

import { ShoppingBagIcon } from "@heroicons/react/24/outline";

// Estado vacío del carrito: claro y con una acción para seguir comprando.
export default function CartEmpty({ onClose }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-(--bg-soft)">
        <ShoppingBagIcon className="h-10 w-10 text-(--text-muted)" />
      </span>
      <div>
        <p className="text-base font-semibold text-(--text-primary)">
          Tu carrito está vacío
        </p>
        <p className="mt-1 text-sm text-(--text-muted)">
          Agrega productos para verlos aquí.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl bg-(--cta-primary) px-5 py-3 text-sm font-semibold text-(--text-inverted) transition hover:opacity-90 cursor-pointer"
      >
        Empezar a comprar
      </button>
    </div>
  );
}
