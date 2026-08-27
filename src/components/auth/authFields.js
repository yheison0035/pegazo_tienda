"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// ---- Validaciones reutilizables ----
export const validators = {
  name: (v) =>
    !v?.trim()
      ? "Escribe tu nombre."
      : v.trim().length < 3
        ? "El nombre es muy corto."
        : "",
  email: (v) =>
    !v?.trim()
      ? "Escribe tu correo."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? "Correo no válido."
        : "",
  password: (v) =>
    !v
      ? "Escribe una contraseña."
      : v.length < 6
        ? "Mínimo 6 caracteres."
        : "",
  loginPassword: (v) => (!v ? "Escribe tu contraseña." : ""),
  phone: (v) =>
    v && !/^\d{7,10}$/.test(v.trim()) ? "Teléfono de 7 a 10 dígitos." : "",
  confirm: (v, other) =>
    !v ? "Repite la contraseña." : v !== other ? "No coincide." : "",
};

const baseInput =
  "w-full rounded-xl border bg-(--bg-page) px-3.5 py-2.5 text-(--text-primary) outline-none transition placeholder:text-(--text-muted)/70";

export function TextField({ label, error, hint, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-(--text-primary)">
          {label}
        </span>
      )}
      <input
        {...props}
        className={`${baseInput} ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-(--border-soft) focus:border-(--brand-accent)"
        } ${className}`}
      />
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-500">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-(--text-muted)">{hint}</span>
      ) : null}
    </label>
  );
}

export function PasswordField({ label, error, hint, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-(--text-primary)">
          {label}
        </span>
      )}
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className={`${baseInput} pr-11 ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-(--border-soft) focus:border-(--brand-accent)"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={show ? "Ocultar" : "Mostrar"}
          tabIndex={-1}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-(--text-muted) transition hover:text-(--text-primary)"
        >
          {show ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-500">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-(--text-muted)">{hint}</span>
      ) : null}
    </label>
  );
}

export function SubmitButton({ loading, children, ...props }) {
  return (
    <button
      {...props}
      type="submit"
      disabled={loading || props.disabled}
      className="w-full cursor-pointer rounded-xl bg-(--cta-primary) py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Un momento…" : children}
    </button>
  );
}
