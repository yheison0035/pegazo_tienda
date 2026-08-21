"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "europea_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch (e) {
      console.error("Error cargando carrito", e);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, ready]);

  function addToCart(product, qty = 1) {
    const safeQty = Number(qty);
    if (!Number.isFinite(safeQty) || safeQty <= 0) {
      return { ok: false };
    }

    const key = `${product.id}-${product.color ?? ""}-${product.size ?? ""}`;

    setItems((prev) => {
      const current = prev.find((p) => p.key === key);

      if (current) {
        const newQty = Math.min(current.quantity + safeQty, product.stock);

        return prev.map((p) =>
          p.key === key ? { ...p, quantity: newQty } : p,
        );
      }

      return [
        ...prev,
        {
          key,
          ...product,
          quantity: Math.min(safeQty, product.stock),
        },
      ];
    });

    return { ok: true };
  }

  function updateItemQuantity(key, newQty) {
    const qty = Number(newQty);
    if (!Number.isFinite(qty)) return;

    setItems((prev) =>
      prev
        .map((p) => (p.key === key ? { ...p, quantity: Math.max(0, qty) } : p))
        .filter((p) => p.quantity > 0),
    );
  }

  function removeFromCart(key) {
    setItems((prev) => prev.filter((p) => p.key !== key));
  }

  function clearCart() {
    setItems([]);
  }

  const count = items.reduce((acc, p) => acc + p.quantity, 0);

  function getItemsByProduct(productId) {
    return items.filter((i) => i.id === productId);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateItemQuantity,
        removeFromCart,
        clearCart,
        count,
        ready,
        getItemsByProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart fuera de CartProvider");
  return ctx;
}
