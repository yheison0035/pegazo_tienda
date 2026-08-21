"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/cartContext";
import { useToast } from "@/context/toastContext";

export default function useProductCartLogic(product, initialQty = 1) {
  const { addToCart, updateItemQuantity, getItemsByProduct, ready } = useCart();

  const toast = useToast();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [colorStock, setColorStock] = useState(0);
  const [qty, setQty] = useState(initialQty);
  const [error, setError] = useState(null);

  const hasColors = product.colors?.length > 0;
  const itemsInCart = getItemsByProduct(product.id);

  // Venta por peso (fruver / carnicería / súper): la cantidad es en kg (decimal)
  // y el precio se entiende por kg.
  const isWeight = product.unit === "PESO";
  const step = isWeight ? 0.5 : 1;
  const minQty = isWeight ? 0.5 : 1;
  const r2 = (n) => Math.round(n * 100) / 100;

  useEffect(() => {
    if (hasColors && product.colors.length === 1) {
      selectColor(product.colors[0]);
    }
  }, [hasColors, product.colors]);

  function selectColor(color) {
    setSelectedColor(color.name);
    // El backend arma el pedido por variante, no por nombre de color.
    setSelectedVariantId(color.variantId ?? null);
    setColorStock(color.stock);
    setError(null);

    const existing = itemsInCart.find((i) => i.color === color.name);

    setQty(existing ? existing.quantity : initialQty);
  }

  function incrementQty() {
    setQty((q) => (r2(q + step) <= colorStock ? r2(q + step) : q));
  }

  function decrementQty() {
    setQty((q) => Math.max(minQty, r2(q - step)));
  }

  function handleAddToCart() {
    if (hasColors && !selectedColor) {
      setError("Selecciona un color");
      return;
    }

    if (qty > colorStock) {
      setError(
        isWeight
          ? `Solo hay ${colorStock} kg disponibles`
          : `Solo hay ${colorStock} unidades disponibles`
      );
      return;
    }

    const key = `${product.id}-${selectedColor}`;
    const existing = itemsInCart.find((i) => i.color === selectedColor);
    if (!existing) {
      addToCart(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: product.price,
          oldPrice: product.oldPrice ?? null,
          discount: product.discount ?? 0,
          images: product.images || product.image,
          color: selectedColor,
          variantId: selectedVariantId,
          stock: colorStock,
        },
        qty,
      );
      toast.success("Se añadio al carrito correctamente");
    } else {
      updateItemQuantity(key, qty);
      toast.success("Se actualiza la cantidad del carrito");
    }

    setError(null);
  }

  const alreadyInCart = !!itemsInCart.find((i) => i.color === selectedColor);

  const actionLabel = alreadyInCart
    ? "Actualizar carrito"
    : "Añadir al carrito";

  return {
    ready,
    hasColors,
    isWeight,
    selectedColor,
    colorStock,
    qty,
    error,
    alreadyInCart,
    actionLabel,
    selectColor,
    incrementQty,
    decrementQty,
    handleAddToCart,
  };
}
