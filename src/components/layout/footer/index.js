"use client";

import Link from "next/link";
import Image from "next/image";
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
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { FaWhatsapp, FaInstagram, FaTiktok, FaFacebookF } from "react-icons/fa";
import { useWebsiteContext } from "@/context/websiteContext";

import {
  getCompanyName,
  getLogo,
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

const LEGAL_LINKS = [
  { href: "/legal/terminos-y-condiciones", label: "Términos y condiciones" },
  { href: "/legal/politicas-de-privacidad", label: "Políticas de privacidad" },
  { href: "/legal/autorizacion-de-datos", label: "Autorización de datos" },
  { href: "/legal/derecho-de-retracto", label: "Derecho de retracto" },
  { href: "/legal/politica-de-envios", label: "Política de envíos" },
  { href: "/legal/cambios-y-devoluciones", label: "Cambios y devoluciones" },
  { href: "/legal/garantias", label: "Política de garantías" },
  { href: "/legal/condiciones-de-promociones", label: "Condiciones de promociones" },
];

const TRUST = [
  {
    Icon: ShieldCheckIcon,
    title: "Compra 100% segura",
    sub: "Tus datos están protegidos",
  },
  {
    Icon: TruckIcon,
    title: "Envíos a todo Colombia",
    sub: "Con transportadoras aliadas",
  },
  {
    Icon: CreditCardIcon,
    title: "Pago seguro",
    sub: "Tarjeta, PSE, Nequi y contra entrega",
  },
  {
    Icon: ChatBubbleLeftRightIcon,
    title: "Atención por WhatsApp",
    sub: "Te acompañamos en tu compra",
  },
];

export default function Footer() {
  const pathname = usePathname();
  const { website } = useWebsiteContext();

  const companyName = getCompanyName(website);
  const logo = getLogo(website);
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

  const socials = [
    { icon: <FaInstagram />, href: instagram, label: "Instagram" },
    { icon: <FaTiktok />, href: tiktok, label: "TikTok" },
    { icon: <FaFacebookF />, href: facebook, label: "Facebook" },
  ].filter((s) => Boolean(s.href));

  const year = new Date().getFullYear();
  const isActive = (href) => pathname === href;
  const handleNavigate = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const linkCls = (href) =>
    `transition ${
      isActive(href)
        ? "text-(--brand-accent) font-medium"
        : "text-(--text-inverted)/70 hover:text-(--brand-accent)"
    }`;

  return (
    <footer className="bg-(--bg-dark) text-(--text-inverted)">
      {/* Franja de confianza */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-5 px-4 py-6 lg:grid-cols-4">
          {TRUST.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-(--brand-accent)/15 text-(--brand-accent)">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{title}</p>
                <p className="truncate text-xs text-(--text-inverted)/60">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Columnas */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              {logo && (
                <Image
                  src={logo}
                  alt={companyName}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 rounded-lg object-contain"
                />
              )}
              <span className="text-lg font-bold">{companyName}</span>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-(--text-inverted)/70">
              {description}
            </p>
            {socials.length > 0 && (
              <nav aria-label="Redes sociales" className="flex gap-3">
                {socials.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-(--text-inverted) transition hover:bg-(--brand-accent) hover:text-(--bg-dark)"
                  >
                    {s.icon}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* La empresa */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-(--text-inverted)/50">
              La empresa
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/legal/quienes-somos"
                  onClick={handleNavigate}
                  className={linkCls("/legal/quienes-somos")}
                >
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link
                  href="https://sedeelectronica.sic.gov.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--text-inverted)/70 transition hover:text-(--brand-accent)"
                >
                  Superintendencia (SIC)
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="text-left text-(--text-inverted)/70 transition hover:text-(--brand-accent)"
                >
                  Preferencias de cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Información legal */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-(--text-inverted)/50">
              Información legal
            </h3>
            <nav aria-label="Información legal">
              <ul className="space-y-2.5 text-sm">
                {LEGAL_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleNavigate}
                      className={linkCls(item.href)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Atención al cliente */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-(--text-inverted)/50">
              Atención al cliente
            </h3>
            <address className="not-italic space-y-3 text-sm text-(--text-inverted)/70">
              {whatsappDigits && (
                <Link
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  className="flex items-center gap-3 transition hover:text-(--brand-accent)"
                >
                  <FaWhatsapp className="text-(--brand-accent)" />
                  {whatsapp}
                </Link>
              )}
              {email && (
                <Link
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 transition hover:text-(--brand-accent)"
                >
                  <EnvelopeIcon className="h-4 w-4 flex-none text-(--brand-accent)" />
                  <span className="truncate">{email}</span>
                </Link>
              )}
              {phone && (
                <p className="flex items-center gap-3">
                  <PhoneIcon className="h-4 w-4 flex-none text-(--brand-accent)" />
                  {phone}
                </p>
              )}
              {address && (
                <p className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 h-4 w-4 flex-none text-(--brand-accent)" />
                  {address}
                </p>
              )}
              {schedule && (
                <p className="flex items-center gap-3">
                  <ClockIcon className="h-4 w-4 flex-none text-(--brand-accent)" />
                  {schedule}
                </p>
              )}
            </address>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-(--text-inverted)/60">
            © {year} <strong className="text-(--text-inverted)">{companyName}</strong>. Todos los derechos reservados.
            {footerText ? ` · ${footerText}` : ""}
          </p>
          <div className="flex items-center gap-2 text-xs text-(--text-inverted)/60">
            <CreditCardIcon className="h-4 w-4 text-(--brand-accent)" />
            Tarjeta · PSE · Nequi · Contra entrega
          </div>
        </div>
      </div>
    </footer>
  );
}
