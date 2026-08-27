"use client";

// Botón "Continuar con Google" MULTI-TENANT.
// No usa el SDK client-side (que exige registrar cada dominio en Google).
// Redirige al flujo central del backend, que funciona en CUALQUIER dominio:
//   <API>/ecommerce/auth/google/start?return=<origen de esta tienda>
// El backend maneja el login con Google y vuelve a este mismo dominio con la
// sesión en la URL (?gtoken=...), que /mi-cuenta guarda automáticamente.

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"
).replace(/\/$/, "");

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function GoogleButton({ text = "Continuar con Google" }) {
  const go = () => {
    if (typeof window === "undefined") return;
    const url = `${API}/ecommerce/auth/google/start?return=${encodeURIComponent(
      window.location.origin,
    )}`;
    window.location.href = url;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center gap-3 text-(--text-muted)">
        <span className="h-px flex-1 bg-(--border-soft)" />
        <span className="text-xs">o</span>
        <span className="h-px flex-1 bg-(--border-soft)" />
      </div>
      <button
        type="button"
        onClick={go}
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-(--border-soft) bg-(--bg-page) py-2.5 font-medium text-(--text-primary) transition hover:bg-(--bg-soft)"
      >
        <GoogleLogo />
        {text}
      </button>
    </div>
  );
}
