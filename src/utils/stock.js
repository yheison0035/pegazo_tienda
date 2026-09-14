// ¿El producto está agotado? Solo se marca cuando estamos SEGUROS de que no hay
// stock: productos sin control de stock (platos) nunca se marcan; con variantes
// se suma el stock de todas; si no hay dato, no se marca.
export function isOutOfStock(product) {
  if (!product) return false;
  if (product.trackStock === false) return false;
  const variants = Array.isArray(product.colors) ? product.colors : [];
  if (variants.length) {
    return variants.reduce((sum, v) => sum + (v.stock || 0), 0) <= 0;
  }
  if (typeof product.stock === "number") return product.stock <= 0;
  return false;
}
