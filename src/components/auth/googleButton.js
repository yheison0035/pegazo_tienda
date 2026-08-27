"use client";

import { useEffect, useRef, useState } from "react";

const GSI_SRC = "https://accounts.google.com/gsi/client";
// Client ID público de Google (OAuth). Se puede sobreescribir por env
// NEXT_PUBLIC_GOOGLE_CLIENT_ID; el valor por defecto deja Google funcionando
// sin configurar nada en el hosting.
const CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "763872388804-5p6fncsiplu0n7iirhbg1bdvjk0dcm38.apps.googleusercontent.com";

// Carga el script de Google Identity Services una sola vez.
function loadGsi() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject();
    if (window.google?.accounts?.id) return resolve();
    let script = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (script) {
      script.addEventListener("load", () => resolve());
      script.addEventListener("error", () => reject());
      return;
    }
    script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
}

// Botón "Continuar con Google". Si no hay NEXT_PUBLIC_GOOGLE_CLIENT_ID
// configurado, no renderiza nada (el resto del formulario funciona igual).
export default function GoogleButton({ onCredential, onError, text = "signin_with" }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (resp) => {
            if (resp?.credential) onCredential?.(resp.credential);
            else onError?.("No se pudo obtener la cuenta de Google.");
          },
        });
        window.google.accounts.id.renderButton(ref.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text, // "signin_with" | "signup_with" | "continue_with"
          shape: "pill",
          logo_alignment: "center",
          width: 320,
        });
        setReady(true);
      })
      .catch(() => onError?.("No se pudo cargar Google."));
    return () => {
      cancelled = true;
    };
  }, [onCredential, onError, text]);

  if (!CLIENT_ID) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center gap-3 text-(--text-muted)">
        <span className="h-px flex-1 bg-(--border-soft)" />
        <span className="text-xs">o</span>
        <span className="h-px flex-1 bg-(--border-soft)" />
      </div>
      <div ref={ref} className="min-h-[40px] [&_*]:cursor-pointer" />
      {!ready && (
        <span className="text-xs text-(--text-muted)">Cargando Google…</span>
      )}
    </div>
  );
}
