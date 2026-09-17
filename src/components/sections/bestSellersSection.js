"use client";

import { useCallback, useEffect, useState } from "react";
import useSections from "@/lib/utils/api/hooks/useSections";
import HorizontalSection from "./horizontalSection";

export default function BestSellersSection() {
  const [items, setItems] = useState([]);
  const { getBestSellers, loading } = useSections();

  const fetchBestSellers = useCallback(async () => {
    try {
      const { data } = await getBestSellers();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  }, [getBestSellers]);

  useEffect(() => {
    fetchBestSellers();
  }, [fetchBestSellers]);

  if (!loading && items.length === 0) return null;

  return (
    <HorizontalSection
      title="Más vendidos"
      subtitle="Los favoritos de nuestros clientes"
      items={items}
      loading={loading}
      type="product"
      layout="horizontal"
    />
  );
}
