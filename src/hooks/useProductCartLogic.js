"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/cartContext";
import { useToast } from "@/context/toastContext";

export default function useProductCartLogic(product, initialQty = 1) {
  const { addToCart, updateItemQuantity, getItemsByProduct, ready } = useCart();
  const toast = useToast();

  // Matriz de variantes: [{ variantId, name(color), size, stock }]
  const variants = product.colors || [];

  // Colores distintos (un representante por color, ignorando ÚNICO/null) y
  // tallas distintas. Un producto puede tener color, talla, ambos o ninguno.
  const colorOptions = useMemo(() => {
    const map = new Map();
    for (const v of variants) {
      if (v.name && v.name !== "ÚNICO" && !map.has(v.name)) map.set(v.name, v);
    }
    return [...map.values()];
  }, [variants]);
  const sizeOptions = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))],
    [variants]
  );

  const hasColors = colorOptions.length > 0;
  const hasSize = sizeOptions.length > 0;
  const isWeight = product.unit === "PESO";
  const step = isWeight ? 0.5 : 1;
  const minQty = isWeight ? 0.5 : 1;
  const r2 = (n) => Math.round(n * 100) / 100;

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(initialQty);
  const [error, setError] = useState(null);

  const itemsInCart = getItemsByProduct(product.id);

  // Variante resuelta según color/talla elegidos.
  const resolved = useMemo(() => {
    return variants.find(
      (v) =>
        (!hasColors || v.name === selectedColor) &&
        (!hasSize || v.size === selectedSize)
    );
  }, [variants, hasColors, hasSize, selectedColor, selectedSize]);

  const selectedVariantId = resolved?.variantId ?? variants[0]?.variantId ?? null;
  // Los elaborados sin control de stock (platos) se pueden pedir siempre.
  const tracksStock = product.trackStock !== false;
  const rawStock =
    resolved?.stock ?? (variants.length === 1 ? variants[0].stock : 0);
  const colorStock = tracksStock ? rawStock : 9999;

  // Preselección: color único / talla única / variante única.
  useEffect(() => {
    if (hasColors && colorOptions.length === 1 && !selectedColor) {
      setSelectedColor(colorOptions[0].name);
    }
    if (hasSize && sizeOptions.length === 1 && !selectedSize) {
      setSelectedSize(sizeOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorOptions.length, sizeOptions.length]);

  function selectColor(color) {
    setSelectedColor(color.name ?? color);
    setError(null);
  }
  function selectSize(size) {
    setSelectedSize(size);
    setError(null);
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
    if (hasSize && !selectedSize) {
      setError("Selecciona una talla");
      return;
    }
    if (!colorStock || qty > colorStock) {
      setError(
        isWeight
          ? `Solo hay ${colorStock} kg disponibles`
          : `Solo hay ${colorStock} unidades disponibles`
      );
      return;
    }

    const key = `${product.id}-${selectedColor ?? ""}-${selectedSize ?? ""}`;
    const existing = itemsInCart.find(
      (i) => i.color === selectedColor && (i.size ?? null) === (selectedSize ?? null)
    );
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
          size: selectedSize,
          variantId: selectedVariantId,
          stock: colorStock,
        },
        qty
      );
      toast.success("Se añadió al carrito correctamente");
    } else {
      updateItemQuantity(key, qty);
      toast.success("Se actualizó la cantidad del carrito");
    }

    setError(null);
  }

  const alreadyInCart = !!itemsInCart.find(
    (i) => i.color === selectedColor && (i.size ?? null) === (selectedSize ?? null)
  );
  const actionLabel = alreadyInCart ? "Actualizar carrito" : "Añadir al carrito";

  return {
    ready,
    hasColors,
    hasSize,
    isWeight,
    colorOptions,
    sizeOptions,
    selectedColor,
    selectedSize,
    colorStock,
    qty,
    error,
    alreadyInCart,
    actionLabel,
    selectColor,
    selectSize,
    incrementQty,
    decrementQty,
    handleAddToCart,
  };
}
