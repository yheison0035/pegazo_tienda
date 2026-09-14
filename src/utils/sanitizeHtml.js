// Sanea HTML enriquecido creado por el dueño en el CRM antes de mostrarlo en la
// tienda. Elimina lo peligroso (scripts, iframes, manejadores on*, javascript:)
// y fuerza que los enlaces abran en pestaña nueva de forma segura. Funciona en
// servidor y cliente (solo string, sin DOM).
export function sanitizeHtml(html) {
  if (!html) return "";
  let s = String(html);

  // Etiquetas peligrosas con y sin cierre.
  s = s.replace(
    /<\s*(script|style|iframe|object|embed|link|meta|form|input|textarea|button)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    "",
  );
  s = s.replace(
    /<\s*(script|style|iframe|object|embed|link|meta|form|input|textarea|button)[^>]*\/?>/gi,
    "",
  );

  // Manejadores de eventos (onclick, onerror, …).
  s = s.replace(/\son\w+\s*=\s*"[^"]*"/gi, "");
  s = s.replace(/\son\w+\s*=\s*'[^']*'/gi, "");
  s = s.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");

  // URLs peligrosas.
  s = s.replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');

  // Enlaces seguros en pestaña nueva.
  s = s.replace(
    /<a\b(?![^>]*\btarget=)/gi,
    '<a target="_blank" rel="noopener noreferrer nofollow" ',
  );

  return s;
}

// Quita el HTML y deja solo texto (para previews compactos como el menú/buscador).
export function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}
