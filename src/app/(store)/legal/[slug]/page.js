import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchFromApi, getSiteUrl, getWebsiteConfig } from "@/lib/website.server";
import { siteName } from "@/lib/seo";
import Container from "@/components/layout/container";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import LegalDoc from "@/components/layout/legal/legalDoc";

async function loadDocs() {
  const res = await fetchFromApi("/website/legal");
  return res?.data || [];
}

export default async function LegalPage({ params }) {
  const { slug } = await params;
  const docs = await loadDocs();
  const doc = docs.find((d) => d.slug === slug);
  if (!doc) return notFound();

  return (
    <>
      <Header />
      <Container>
        <main className="px-4 py-10 md:pt-49 pt-70">
          <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[260px_1fr]">
            {/* Navegación entre documentos legales: chips horizontales en móvil,
                lista vertical fija en desktop. */}
            <aside
              className="lg:sticky lg:h-fit"
              style={{ top: "calc(var(--edit-bar-h, 0px) + 10.5rem)" }}
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                Información legal
              </p>
              <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
                {docs.map((d) => {
                  const active = d.slug === slug;
                  return (
                    <Link
                      key={d.slug}
                      href={`/legal/${d.slug}`}
                      className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition lg:whitespace-normal ${
                        active
                          ? "bg-(--brand-accent)/12 font-semibold text-(--brand-accent)"
                          : "bg-(--bg-soft) text-(--text-secondary) hover:bg-(--bg-muted) lg:bg-transparent lg:hover:bg-(--bg-soft)"
                      }`}
                    >
                      {d.title}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Documento */}
            <article className="min-w-0 rounded-2xl border border-(--border-soft) bg-(--bg-page) p-6 shadow-sm sm:p-8">
              <LegalDoc slug={doc.slug} title={doc.title} html={doc.html} />
            </article>
          </div>
        </main>
      </Container>
      <Footer />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const [siteUrl, website, docs] = await Promise.all([
    getSiteUrl(),
    getWebsiteConfig(),
    loadDocs(),
  ]);
  const doc = docs.find((d) => d.slug === slug) || null;

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
