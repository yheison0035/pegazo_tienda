"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useCart } from "@/context/cartContext";
import CartDrawer from "../../cart/cartDrawer";

export default function CartIcon() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex cursor-pointer items-center rounded-full p-2 text-(--text-primary) transition hover:bg-(--bg-soft) hover:text-(--brand-accent)"
        aria-label="Carrito de compras"
      >
        <ShoppingCartIcon className="w-6 h-6 transition group-hover:scale-110" />

        {count > 0 && (
          <span
            className="
              absolute -top-2 -right-2
              bg-(--cta-primary)
              text-white text-xs
              w-5 h-5 rounded-full
              flex items-center justify-center
              shadow
            "
          >
            {count}
          </span>
        )}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
