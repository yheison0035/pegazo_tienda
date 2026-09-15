"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { openCookiePreferences } from "@/components/ui/cookieConsent";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { FaWhatsapp, FaInstagram, FaTiktok, FaFacebookF } from "react-icons/fa";
import { useWebsiteContext } from "@/context/websiteContext";

import {
  getCompanyName,
  getPhone,
  getEmail,
  getWhatsapp,
  getWhatsappDigits,
  getAddress,
  getSchedule,
  getFacebook,
  getInstagram,
  getTikTok,
  getFooterText,
  getDescription,
} from "@/lib/website";

export default function Footer() {
  const pathname = usePathname();

  const { website } = useWebsiteContext();

  const companyName = getCompanyName(website);
  const phone = getPhone(website);
  const email = getEmail(website);
  const whatsapp = getWhatsapp(website);
  const address = getAddress(website);
  const schedule = getSchedule(website);

  const facebook = getFacebook(website);
  const instagram = getInstagram(website);
  const tiktok = getTikTok(website);

  const footerText = getFooterText(website);
  const description = getDescription(website);
  const whatsappDigits = getWhatsappDigits(website);

  // Solo se muestran las redes que la empresa configuró.
  const socials = [
    { icon: <FaInstagram />, href: instagram, label: "Instagram" },
    { icon: <FaTiktok />, href: tiktok, label: "TikTok" },
    { icon: <FaFacebookF />, href: facebook, label: "Facebook" },
  ].filter((social) => Boolean(social.href));

  const year = new Date().getFullYear();

  const isActive = (href) => pathname === href;

  const handleNavigate = () => {
    // asegura que al cambiar de documento legal,
    // el usuario empiece a leer desde arriba
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-(--bg-dark) text-(--text-inverted)">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Nuestra empresa</h3>

            <p className="text-sm text-(--text-muted) mb-4 leading-relaxed">
              {description}
            </p>

            <ul className="space-y-2 text-sm text-(--text-muted)">
              <li>
                <Link
                  href="/legal/quienes-somos"
                  onClick={handleNavigate}
                  className={`
                    transition
                    ${
                      isActive("/legal/quienes-somos")
                        ? "text-(--brand-accent) font-medium underline"
                        : "hover:text-(--brand-accent)"
                    }
                  `}
                >
                  Quiénes somos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Información legal</h3>

            <nav aria-label="Información legal">
              <ul className="space-y-2 text-sm text-(--text-muted)">
                {[
                  {
                    href: "/legal/terminos-y-condiciones",
                    label: "Términos y condiciones",
                  },
                  {
                    href: "/legal/politicas-de-privacidad",
                    label: "Políticas de privacidad",
                  },
                  {
                    href: "/legal/autorizacion-de-datos",
                    label: "Autorización de datos",
                  },
                  {
                    href: "/legal/derecho-de-retracto",
                    label: "Derecho de retracto",
                  },
                  {
                    href: "/legal/politica-de-envios",
                    label: "Política de envíos",
                  },
                  {
                    href: "/legal/cambios-y-devoluciones",
                    label: "Cambios y devoluciones",
                  },
                  { href: "/legal/garantias", label: "Política de garantías" },
                  {
                    href: "/legal/condiciones-de-promociones",
                    label: "Condiciones de promociones",
                  },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleNavigate}
                      className={`
                        transition
                        ${
                          isActive(item.href)
                            ? "text-(--brand-accent) font-medium underline"
                            : "hover:text-(--brand-accent)"
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="https://sedeelectronica.sic.gov.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-(--brand-accent)"
                  >
                    Superintendencia de Industria y Comercio (SIC)
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openCookiePreferences}
                    className="text-left hover:text-(--brand-accent)"
                  >
                    Preferencias de cookies
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contáctenos</h3>

            <address className="not-italic space-y-3 text-sm text-(--text-muted)">
              {whatsappDigits && (
                <p className="flex items-center gap-3">
                  <FaWhatsapp className="text-(--brand-accent)" />
                  <Link
                    href={`https://wa.me/${whatsappDigits}`}
                    className="hover:text-(--brand-accent)"
                    target="_blank"
                  >
                    {whatsapp}
                  </Link>
                </p>
              )}

              {email && (
                <p className="flex items-center gap-3">
                  <EnvelopeIcon className="w-4 h-4 text-(--brand-accent)" />
                  <Link
                    href={`mailto:${email}`}
                    className="hover:text-(--brand-accent)"
                  >
                    {email}
                  </Link>
                </p>
              )}

              {phone && (
                <p className="flex items-center gap-3">
                  <PhoneIcon className="w-4 h-4 text-(--brand-accent)" />
                  {phone}
                </p>
              )}

              {address && (
                <p className="flex items-center gap-3">
                  <MapPinIcon className="w-4 h-4 text-(--brand-accent)" />
                  {address}
                </p>
              )}

              {schedule && (
                <p className="flex items-center gap-3">
                  <ClockIcon className="w-4 h-4 text-(--brand-accent)" />
                  {schedule}
                </p>
              )}
            </address>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Síguenos</h3>

            <nav aria-label="Redes sociales" className="flex gap-4 mb-6">
              {socials.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    bg-(--brand-secondary)
                    text-(--text-inverted)
                    hover:bg-(--brand-accent)
                    hover:text-(--bg-dark)
                    transition
                  "
                >
                  {social.icon}
                </Link>
              ))}
            </nav>

            <ul className="space-y-2 text-sm text-(--text-muted)">
              <li className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-(--brand-accent)" />
                Compra segura
              </li>
              <li className="flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-(--brand-accent)" />
                Envíos a todo Colombia
              </li>
              <li className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-(--brand-accent)" />
                Atención por WhatsApp
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300/20" />

      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-(--text-muted)">
        © {year} <strong>{companyName}</strong>. Todos los derechos reservados.
        <p className="mt-2 text-xs">{footerText}</p>
      </div>

    </footer>
  );
}
