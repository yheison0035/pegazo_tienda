"use client";

import { useState } from "react";
import ProductFeatures from "./productDescription/productFeatures";
import ProductSpecifications from "./productDescription/productSpecifications";
import useVertical from "@/hooks/useVertical";
import RichHtml from "@/components/ui/richHtml";

const DESCRIPTION_LIMIT = 500;

export default function ProductDescription({ product }) {
  const [expanded, setExpanded] = useState(false);
  const v = useVertical();
  // Fichas técnicas (características/especificaciones) solo en verticales que las
  // usan (electrónica/televentas). Un restaurante o fruver no las muestra.
  const showExtra =
    v.showSpecs &&
    (product.features.length > 0 || product.specifications.length > 0);

  if (!product.description && !showExtra) return null;

  // El colapso se hace por ALTURA (no cortando el HTML, que rompería etiquetas).
  const hasLongDescription =
    product.description && product.description.length > DESCRIPTION_LIMIT;

  return (
    <section className="mt-10 sm:mt-14 bg-white border border-(--border-soft) rounded-2xl p-4 sm:p-6 space-y-10">
      {product.description && (
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3">
            Descripción del producto
          </h3>

          <div
            className={`text-(--text-secondary) ${
              !expanded && hasLongDescription
                ? "max-h-48 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
                : ""
            }`}
          >
            <RichHtml html={product.description} />
          </div>

          {hasLongDescription && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="
                mt-2
                text-sm
                font-medium
                text-(--brand-accent)
                hover:underline
                cursor-pointer
              "
            >
              {expanded ? "Ver menos" : "Ver más"}
            </button>
          )}
        </div>
      )}

      {showExtra && product.features.length > 0 && (
        <ProductFeatures features={product.features} />
      )}

      {showExtra && product.specifications.length > 0 && (
        <ProductSpecifications specifications={product.specifications} />
      )}
    </section>
  );
}
