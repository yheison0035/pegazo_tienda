export function mapSearchProduct(product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    oldPrice: product.oldPrice,
    discount: product.discount,
    stock: product.stock,
    colors: product.colors,
    image: product.image,
    images: product.images,
    description: product.description,
    category: product.category,
    unit: product.unit,
    trackStock: product.trackStock,
    // Etiquetas opcionales del producto (si el backend las envía).
    tags: product.tags || product.labels || [],
  };
}
