"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "europeatvstore_cookie_consent";
const VERSION = 1; // subir si cambian las categorías/política para re-pedir consentimiento

export function getCookieConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || c.v !== VERSION) return null;
    return c;
  } catch {
    return null;
  }
}

// Abre las preferencias desde cualquier parte (p. ej. enlace del footer).
export function openCookiePreferences() {
  window.dispatchEvent(new Event("open-cookie-preferences"));
}

export default function CookieConsent({ onVisibleChange }) {
  const [visible, setVisible] = useState(false); // barra inicial
  const [showPrefs, setShowPrefs] = useState(false); // modal de preferencias
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  const emitVisible = (v) => {
    setVisible(v);
    onVisibleChange?.(v);
  };

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      emitVisible(true);
    } else {
      setPrefs({
        analytics: !!existing.analytics,
        marketing: !!existing.marketing,
      });
    }

    const openPrefs = () => {
      const c = getCookieConsent();
      if (c)
        setPrefs({ analytics: !!c.analytics, marketing: !!c.marketing });
      setShowPrefs(true);
    };
    window.addEventListener("open-cookie-preferences", openPrefs);
    return () =>
      window.removeEventListener("open-cookie-preferences", openPrefs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (value) => {
    const consent = {
      necessary: true,
      analytics: !!value.analytics,
      marketing: !!value.marketing,
      v: VERSION,
      date: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      /* almacenamiento bloqueado */
    }
    // Aviso para que futuros scripts (analítica/marketing) reaccionen al consentimiento.
    try {
      window.dispatchEvent(
        new CustomEvent("cookie-consent-updated", { detail: consent }),
      );
    } catch {
      /* noop */
    }
    setPrefs({ analytics: consent.analytics, marketing: consent.marketing });
    setShowPrefs(false);
    emitVisible(false);
  };

  const acceptAll = () => persist({ analytics: true, marketing: true });
  const rejectAll = () => persist({ analytics: false, marketing: false });
  const savePrefs = () => persist(prefs);

  if (!visible && !showPrefs) return null;

  return (
    <>
      {/* Barra inferior (primer ingreso) */}
      {visible && !showPrefs && (
        <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-(--border-soft) bg-(--bg-page) p-4 shadow-2xl">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-(--text-secondary)">
              Usamos cookies propias y de terceros para el funcionamiento del
              sitio, recordar tu carrito y mejorar tu experiencia. Puedes aceptar
              todas, rechazar las no esenciales o configurarlas. Más información en
              nuestra{" "}
              <Link
                href="/legal/politicas-de-privacidad"
                className="font-medium text-(--brand-accent) underline"
              >
                Política de Privacidad
              </Link>
              .
            </p>

            <div className="flex flex-nowrap items-center gap-2 md:flex-none">
              <button
                onClick={() => setShowPrefs(true)}
                className="flex-1 whitespace-nowrap rounded-lg border border-(--border-soft) px-2.5 py-2 text-xs font-medium text-(--text-secondary) transition hover:bg-(--bg-soft) sm:flex-none sm:px-4 sm:text-sm"
              >
                Configurar
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 whitespace-nowrap rounded-lg border border-(--border-soft) px-2.5 py-2 text-xs font-medium text-(--text-secondary) transition hover:bg-(--bg-soft) sm:flex-none sm:px-4 sm:text-sm"
              >
                Rechazar
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 whitespace-nowrap rounded-lg bg-(--cta-primary) px-2.5 py-2 text-xs font-semibold text-(--text-inverted) transition hover:opacity-90 sm:flex-none sm:px-5 sm:text-sm"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de preferencias por categoría */}
      {showPrefs && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => (visible ? setShowPrefs(false) : emitVisible(false))}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-(--bg-page) shadow-2xl sm:rounded-2xl"
          >
            <div className="border-b border-(--border-soft) px-6 py-4">
              <h2 className="text-lg font-bold text-(--text-primary)">
                Preferencias de cookies
              </h2>
              <p className="text-sm text-(--text-muted)">
                Elige qué cookies permites. Las necesarias no se pueden desactivar.
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              <Category
                title="Necesarias"
                desc="Imprescindibles para el funcionamiento del sitio: carrito, sesión y seguridad. Siempre activas."
                checked
                locked
              />
              <Category
                title="Analíticas"
                desc="Nos ayudan a entender cómo se usa el sitio para mejorarlo (estadísticas anónimas)."
                checked={prefs.analytics}
                onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
              />
              <Category
                title="Marketing"
                desc="Permiten mostrarte contenido y promociones más relevantes."
                checked={prefs.marketing}
                onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-(--border-soft) p-4">
              <button
                onClick={rejectAll}
                className="rounded-lg border border-(--border-soft) px-4 py-2 text-sm font-medium text-(--text-secondary) transition hover:bg-(--bg-soft)"
              >
                Rechazar todas
              </button>
              <button
                onClick={savePrefs}
                className="rounded-lg border border-(--border-soft) px-4 py-2 text-sm font-medium text-(--text-secondary) transition hover:bg-(--bg-soft)"
              >
                Guardar selección
              </button>
              <button
                onClick={acceptAll}
                className="rounded-lg bg-(--cta-primary) px-5 py-2 text-sm font-semibold text-(--text-inverted) transition hover:opacity-90"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Category({ title, desc, checked, locked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-(--border-soft) p-3">
      <div>
        <p className="text-sm font-semibold text-(--text-primary)">{title}</p>
        <p className="text-xs text-(--text-muted)">{desc}</p>
      </div>
      <button
        type="button"
        disabled={locked}
        onClick={() => !locked && onChange?.(!checked)}
        aria-pressed={checked}
        className={`relative mt-0.5 inline-flex h-6 w-11 flex-none items-center rounded-full transition ${
          checked ? "bg-(--cta-primary)" : "bg-(--border-strong)"
        } ${locked ? "opacity-60" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
