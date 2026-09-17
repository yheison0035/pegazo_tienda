import CatalogClient from "@/components/layout/catalog/catalogClient";
import JsonLd from "@/components/seo/jsonLd";
import RichHtml from "@/components/ui/richHtml";
import {
  fetchFromApi,
  getSiteUrl,
  getWebsiteConfig,
} from "@/lib/website.server";
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
  humanize,
  siteDescription,
  siteName,
} from "@/lib/seo";

/** Novedades y ofertas son listados especiales, no categorías del inventario. */
function catalogQuery(category) {
  if (category === "novedades") return "mode=new";
  if (category === "ofertas") return "mode=offers";
  if (category === "mas-vendidos") return "mode=bestsellers";

  return `mode=category&category=${encodeURIComponent(category)}`;
}

function categoryTitle(category) {
  if (category === "novedades") return "Novedades";
  if (category === "ofertas") return "Ofertas";
  if (category === "mas-vendidos") return "Más vendidos";

  return humanize(category);
}

/** El listado se pide en el servidor para que los productos salgan en el HTML. */
async function loadCatalog(category) {
  const response = await fetchFromApi(
    `/ecommerce/catalog?${catalogQuery(category)}`,
  ).catch(() => null);

  return response?.success ? response : null;
}

export default async function CatalogPage(props) {
  const params = await props.params;
  const category = params.category;

  const [siteUrl, catalog] = await Promise.all([
    getSiteUrl(),
    loadCatalog(category),
  ]);

  const name = categoryTitle(category);

  const breadcrumb = buildBreadcrumbSchema(siteUrl, [
    { name, url: `${siteUrl}/${category}` },
  ]);

  const itemList = buildItemListSchema({
    products: catalog?.data,
    category,
    siteUrl,
    name,
  });

  const categoryDescription = catalog?.category?.description;

  return (
    <>
      <JsonLd schema={breadcrumb} />
      <JsonLd schema={itemList} />

      <CatalogClient category={category} initialCatalog={catalog} />

      {categoryDescription && (
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-10">
          <div className="rounded-2xl border border-(--border-soft) bg-(--bg-page) p-5 text-(--text-secondary) sm:p-6">
            <RichHtml html={categoryDescription} />
          </div>
        </div>
      )}
    </>
  );
}

export async function generateMetadata(props) {
  const params = await props.params;
  const category = params?.category;

  const [siteUrl, website] = await Promise.all([
    getSiteUrl(),
    getWebsiteConfig(),
  ]);

  const name = siteName(website);
  const baseDescription = siteDescription(website);
  const logo = website?.company?.logo;

  if (!category) {
    return {
      title: name,
      description: baseDescription,
      alternates: { canonical: siteUrl },
    };
  }

  const categoryName = categoryTitle(category);
  const url = `${siteUrl}/${category}`;

  // Con el número real de productos la descripción es más útil en resultados.
  const catalog = await loadCatalog(category);
  const total = catalog?.total || 0;

  const description = total
    ? `${categoryName} en ${name}: ${total} ${
        total === 1 ? "producto disponible" : "productos disponibles"
      }. ${baseDescription}`
    : `${categoryName} en ${name}. ${baseDescription}`;

  return {
    // El layout raíz añade el nombre del sitio con su plantilla "%s | Sitio".
    title: categoryName,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${categoryName} | ${name}`,
      description,
      url,
      siteName: name,
      locale: "es_CO",
      type: "website",
      images: logo ? [{ url: logo, alt: name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} | ${name}`,
      description,
      images: logo ? [logo] : [],
    },
  };
}
