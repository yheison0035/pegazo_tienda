import ProductPage from "@/components/layout/pdp/productPage";
import JsonLd from "@/components/seo/jsonLd";
import {
  fetchFromApi,
  getSiteUrl,
  getWebsiteConfig,
} from "@/lib/website.server";
import {
  buildBreadcrumbSchema,
  buildProductSchema,
  humanize,
  siteDescription,
  siteName,
} from "@/lib/seo";
import { stripHtml } from "@/utils/sanitizeHtml";

/** El producto se pide en el servidor para que salga en el HTML. */
async function loadProduct(slug) {
  const response = await fetchFromApi(`/ecommerce/product/${slug}`).catch(
    () => null,
  );

  return response?.data || null;
}

export default async function ContentPDP(props) {
  const params = await props.params;
  const category = params.category;
  const productSlug = params.product;

  const [siteUrl, website, product] = await Promise.all([
    getSiteUrl(),
    getWebsiteConfig(),
    loadProduct(productSlug),
  ]);

  const breadcrumb = buildBreadcrumbSchema(siteUrl, [
    { name: humanize(category), url: `${siteUrl}/${category}` },
    {
      name: product?.name || humanize(productSlug),
      url: `${siteUrl}/${category}/${productSlug}`,
    },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumb} />
      <JsonLd
        schema={buildProductSchema({ product, category, website, siteUrl })}
      />

      <ProductPage
        category={category}
        productSlug={productSlug}
        initialProduct={product}
      />
    </>
  );
}

export async function generateMetadata(props) {
  const params = await props.params;
  const category = params?.category;
  const productSlug = params?.product;

  const [siteUrl, website] = await Promise.all([
    getSiteUrl(),
    getWebsiteConfig(),
  ]);

  const name = siteName(website);
  const baseDescription = siteDescription(website);

  if (!category || !productSlug) {
    return {
      title: name,
      description: baseDescription,
      alternates: { canonical: siteUrl },
    };
  }

  const product = await loadProduct(productSlug);

  const productName = product?.name || humanize(productSlug);

  const description = product?.description
    ? stripHtml(product.description).replace(/\s+/g, " ").trim().slice(0, 160)
    : `${productName} en ${name}. ${baseDescription}`;

  const url = `${siteUrl}/${category}/${productSlug}`;

  const images = product?.images?.length
    ? product.images.slice(0, 4).map((image) => ({ url: image, alt: productName }))
    : website?.company?.logo
      ? [{ url: website.company.logo, alt: name }]
      : [];

  return {
    // El layout raíz añade el nombre del sitio con su plantilla "%s | Sitio".
    title: productName,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${productName} | ${name}`,
      description,
      url,
      siteName: name,
      locale: "es_CO",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${productName} | ${name}`,
      description,
      images: images.map((image) => image.url),
    },
  };
}
