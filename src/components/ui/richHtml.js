import { sanitizeHtml } from "@/utils/sanitizeHtml";

/**
 * Muestra HTML enriquecido (creado en el CRM) ya saneado, con estilos acordes
 * al tema de la tienda (negrita, listas, alineación, enlaces con color de marca).
 */
export default function RichHtml({ html, className = "" }) {
  if (!html) return null;
  return (
    <>
      <div
        className={`rich-html ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      />
      <style>{`
        .rich-html { line-height: 1.6; }
        .rich-html b, .rich-html strong { font-weight: 700; }
        .rich-html i, .rich-html em { font-style: italic; }
        .rich-html u { text-decoration: underline; }
        .rich-html a { color: var(--brand-accent); text-decoration: underline; }
        .rich-html ul { list-style: disc; padding-left: 1.25rem; margin: .35rem 0; }
        .rich-html ol { list-style: decimal; padding-left: 1.25rem; margin: .35rem 0; }
        .rich-html li { margin: .15rem 0; }
        .rich-html p { margin: .35rem 0; }
        .rich-html a:hover { opacity: .85; }
      `}</style>
    </>
  );
}
