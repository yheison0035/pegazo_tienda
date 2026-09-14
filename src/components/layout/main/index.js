import Container from "@/components/layout/container";
import OffersSection from "@/components/sections/offersSection";
import SectionWrapper from "../sectionWrapper";
import CategoriesSection from "@/components/sections/categoriesSection";
import NewsSection from "@/components/sections/newsSection";
import HeroSection from "@/components/sections/heroSection";

export default function Main() {
  return (
    <main className="bg-(--bg-soft) md:pt-49 pt-70">
      {/* Banner a TODO el ancho, pegado bajo el header (fuera del contenedor). */}
      <HeroSection />

      <Container>
        <div className="pt-10">
          <SectionWrapper>
            <CategoriesSection />
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
