"use client";

import { useEffect, useState } from "react";
import Container from "@/components/layout/container";
import OffersSection from "@/components/sections/offersSection";
import SectionWrapper from "../sectionWrapper";
import CategoriesSection from "@/components/sections/categoriesSection";
import NewsSection from "@/components/sections/newsSection";
import BestSellersSection from "@/components/sections/bestSellersSection";
import HeroSection from "@/components/sections/heroSection";

export default function Main() {
  // Mide la altura REAL del header (fijo) para que el contenido arranque justo
  // debajo, sin espacio blanco ni quedar tapado. Clases pt-* quedan de respaldo
  // mientras se mide (evita el salto inicial).
  const [padTop, setPadTop] = useState(0);
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const measure = () => setPadTop(header.offsetHeight);
    measure();
    window.addEventListener("resize", measure);
    let ro;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(measure);
      ro.observe(header);
    }
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

  return (
    <main
      className="bg-(--bg-soft) md:pt-49 pt-70"
      style={padTop ? { paddingTop: padTop } : undefined}
    >
      {/* Banner a TODO el ancho, pegado bajo el header (fuera del contenedor). */}
      <HeroSection />

      <Container>
        <div className="pt-10">
          <SectionWrapper>
            <CategoriesSection />
          </SectionWrapper>

          <SectionWrapper>
            <BestSellersSection />
          </SectionWrapper>

          <SectionWrapper>
            <NewsSection />
          </SectionWrapper>

          <SectionWrapper>
            <OffersSection />
          </SectionWrapper>
        </div>
      </Container>
    </main>
  );
}
