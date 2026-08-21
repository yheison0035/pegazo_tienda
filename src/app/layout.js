import Providers from "@/context/providers";
import { ToastProvider } from "@/context/toastContext";
import { NavProvider } from "@/context/navigationContext";
import { getFontClass } from "@/styles/fonts";
import { buildThemeCss } from "@/styles/themes";
import "@/styles/globals.css";
import GlobalUI from "@/components/layout/globalUI";
import VerticalPreviewCapture from "@/components/verticalPreviewCapture";
import JsonLd from "@/components/seo/jsonLd";
import { getSiteUrl, getWebsiteConfig } from "@/lib/website.server";
import {
  buildStoreSchema,
  buildWebSiteSchema,
  siteDescription,
  siteName,
} from "@/lib/seo";

// Todo depende del dominio de la petición: nada se puede prerenderizar.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const siteUrl = await getSiteUrl();
  const website = await getWebsiteConfig();

  const company = website?.company;
  const settings = website?.settings;

  if (!company) {
    // Sin configuración no sabemos de qué negocio es el dominio.
    return {
      title: "Sitio web",
      description: "Sitio web",
      robots: { index: false, follow: false },
    };
  }

  const title = settings?.metaTitle || siteName(website);
  const description = siteDescription(website);
  const logo = company.logo;

  // El icono de la pestaña es el favicon que suba la empresa y, si no tiene,
  // su propio logo. Nunca un archivo fijo del proyecto.
  const iconUrl = company.favicon || logo || "/favicon.ico";

  return {
    metadataBase: new URL(siteUrl),

    title: {
      default: title,
      template: `%s | ${title}`,
    },

    description,

    applicationName: siteName(website),

    alternates: {
      canonical: siteUrl,
    },

    icons: {
      icon: [{ url: iconUrl }],
      shortcut: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
    },

    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: siteName(website),
      locale: "es_CO",
      type: "website",
      images: logo ? [{ url: logo, alt: siteName(website) }] : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: logo ? [logo] : [],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    formatDetection: {
      telephone: true,
      address: true,
      email: true,
    },
  };
}

export default async function RootLayout({ children }) {
  // El tema, los colores y la tipografía salen de la empresa dueña del dominio.
  // Se resuelven en el servidor para que la tienda no parpadee al cargar.
  const siteUrl = await getSiteUrl();
  const website = await getWebsiteConfig();
  const company = website?.company;

  const themeCss = buildThemeCss(company);
  const fontClass = getFontClass(company?.fontFamily);

  return (
    <html lang="es-CO" data-theme={company?.theme || "clasico"}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {company?.primaryColor && (
          <meta name="theme-color" content={company.primaryColor} />
        )}
      </head>
      <body className={`${fontClass} antialiased`}>
        {/* Negocio y sitio: se emiten en el servidor, en todas las páginas. */}
        <JsonLd schema={buildStoreSchema(website, siteUrl)} />
        <JsonLd schema={buildWebSiteSchema(website, siteUrl)} />

        <NavProvider>
          <ToastProvider>
            <Providers initialWebsite={website}>
              <VerticalPreviewCapture />
              {children}
              <GlobalUI />
            </Providers>
          </ToastProvider>
        </NavProvider>
      </body>
    </html>
  );
}
