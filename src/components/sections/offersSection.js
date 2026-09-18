"use client";

import { useCallback, useEffect, useState } from "react";
import useSections from "@/lib/utils/api/hooks/useSections";
import HorizontalSection from "./horizontalSection";

export default function OffersSection() {
  const [offers, setOffers] = useState([]);
  const { getOffers, loading } = useSections();

  const fetchOffers = useCallback(async () => {
    try {
      const { data } = await getOffers();
      setOffers(data);
    } catch (err) {
      console.error(err);
    }
  }, [getOffers]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  if (!loading && offers.length === 0) return null;

  return (
    <HorizontalSection
      title="Ofertas"
      subtitle="Descuentos que no duran"
      viewAllHref="/ofertas"
      items={offers}
      loading={loading}
      type="product"
      layout="horizontal"
    />
  );
}
