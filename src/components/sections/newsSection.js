"use client";

import { useCallback, useEffect, useState } from "react";
import useSections from "@/lib/utils/api/hooks/useSections";
import HorizontalSection from "./horizontalSection";

export default function NewsSection() {
  const [news, setNews] = useState([]);
  const { getNews, loading } = useSections();

  const fetchNews = useCallback(async () => {
    try {
      const { data } = await getNews();
      setNews(data);
    } catch (err) {
      console.error(err);
    }
  }, [getNews]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  if (!loading && news.length === 0) return null;

  return (
    <HorizontalSection
      title="Novedades"
      subtitle="Lo último que llegó para ti"
      viewAllHref="/novedades"
      items={news}
      loading={loading}
      type="product"
      layout="horizontal"
    />
  );
}
