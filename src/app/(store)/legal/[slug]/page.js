import { notFound } from "next/navigation";
import { fetchFromApi, getSiteUrl, getWebsiteConfig } from "@/lib/website.server";
import { siteName } from "@/lib/seo";
import Container from "@/components/layout/container";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import LegalDoc from "@/components/layout/legal/legalDoc";

async function loadDoc(slug) {
  const res = await fetchFromApi("/website/legal");
  const docs = res?.data || [];
  return docs.find((d) => d.slug === slug) || null;
}

export default async function LegalPage({ params }) {
  const { slug } = await params;
  const doc = await loadDoc(slug);
  if (!doc) return notFound();

  return (
    <>
      <Header />
      <Container>
        <main className="px-4 py-10 md:pt-49 pt-70">
          <LegalDoc slug={doc.slug} title={doc.title} html={doc.html} />
        </main>
      </Container>
      <Footer />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const [siteUrl, website, doc] = await Promise.all([
    getSiteUrl(),
    getWebsiteConfig(),
    loadDoc(slug),
  ]);

  const name = siteName(website);

  if (!doc) {
    return { title: "Página no encontrada", robots: { index: false } };
  }

  const description = `${doc.title} de ${name}.`;
  const url = `${siteUrl}/legal/${slug}`;

  return {
    title: doc.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${doc.title} | ${name}`,
      description,
      url,
      siteName: name,
      locale: "es_CO",
      type: "article",
    },
  };
}
