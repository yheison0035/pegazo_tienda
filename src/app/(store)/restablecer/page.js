"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Container from "@/components/layout/container";
import { useCustomer } from "@/context/customerContext";
import {
  PasswordField,
  SubmitButton,
  validators,
} from "@/components/auth/authFields";

export default function RestablecerPage() {
  const { resetPassword } = useCustomer();
  const router = useRouter();
  const [token, setToken] = useState(null); // null = comprobando
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("token");
      setToken(t || "");
    } catch {
      setToken("");
    }
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    const next = {};
    const pErr = validators.password(form.password);
    const cErr = validators.confirm(form.confirm, form.password);
    if (pErr) next.password = pErr;
    if (cErr) next.confirm = cErr;
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await resetPassword({ token, password: form.password });
      setDone(true);
      setTimeout(() => router.push("/mi-cuenta"), 1800);
    } catch (err) {
      setFormError(
        err?.message || "El enlace expiró o no es válido. Solicítalo de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header />
      <Container>
        <main className="px-4 pb-16 md:pt-49 pt-70">
          <h1 className="mb-8 text-center text-3xl font-bold text-(--text-primary)">
            Nueva contraseña
          </h1>

          <div className="mx-auto w-full max-w-md">
            {token === null ? (
              <p className="py-10 text-center text-(--text-muted)">Cargando…</p>
            ) : token === "" ? (
              <p className="rounded-lg bg-red-500/10 px-3 py-3 text-center text-sm text-red-600">
                El enlace no es válido. Vuelve a solicitar el restablecimiento
                desde{" "}
                <a href="/mi-cuenta" className="cursor-pointer font-semibold underline">
                  Mi cuenta
                </a>
                .
              </p>
            ) : done ? (
              <p className="rounded-lg bg-emerald-500/10 px-3 py-4 text-center text-sm text-emerald-600">
                ¡Contraseña actualizada! Entrando a tu cuenta…
              </p>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-4">
                <PasswordField
                  label="Nueva contraseña"
                  value={form.password}
                  onChange={set("password")}
                  error={errors.password}
                  autoComplete="new-password"
                  hint="Mínimo 6 caracteres."
                />
                <PasswordField
                  label="Repite la contraseña"
                  value={form.confirm}
                  onChange={set("confirm")}
                  error={errors.confirm}
                  autoComplete="new-password"
                />
                {formError && (
                  <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
                    {formError}
                  </p>
                )}
                <SubmitButton loading={busy}>Guardar contraseña</SubmitButton>
              </form>
            )}
          </div>
        </main>
      </Container>
      <Footer />
    </>
  );
}
