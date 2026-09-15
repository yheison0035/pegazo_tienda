"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Container from "@/components/layout/container";
import { useEditMode } from "@/context/editModeContext";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const websiteDomain =
  process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ||
  (typeof window !== "undefined" ? window.location.hostname : "");

export default function EditarPage() {
  const router = useRouter();
  const { setEditToken, isEditing, logoutEdit } = useEditMode();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/website/owner/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Website-Domain": websiteDomain,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo iniciar sesión.");
      setEditToken(data.token);
      router.push("/");
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header />
      <Container>
        <main className="px-4 pb-16 md:pt-49 pt-70">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-(--text-primary)">
                Editar mi tienda
              </h1>
              <p className="mt-1 text-sm text-(--text-muted)">
                Ingresa con tu cuenta de administrador para editar los textos de
                la tienda directamente.
              </p>
            </div>

            {isEditing ? (
              <div className="rounded-2xl border border-(--border-soft) bg-(--bg-page) p-6 text-center shadow-sm">
                <p className="mb-4 text-sm text-(--text-secondary)">
                  Ya estás en <b>modo edición</b>. Abre cualquier documento legal
                  (por ejemplo desde el pie de página) para editarlo.
                </p>
                <button
                  onClick={logoutEdit}
                  className="rounded-lg border border-(--border-soft) px-4 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--bg-soft)"
                >
                  Salir del modo edición
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="space-y-4 rounded-2xl border border-(--border-soft) bg-(--bg-page) p-6 shadow-sm"
              >
                <div>
                  <label className="mb-1 block text-sm text-(--text-muted)">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-(--border-soft) bg-(--bg-page) px-4 py-2.5 outline-none focus:ring-2 focus:ring-(--brand-accent)/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-(--text-muted)">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-(--border-soft) bg-(--bg-page) px-4 py-2.5 outline-none focus:ring-2 focus:ring-(--brand-accent)/30"
                  />
                </div>
                {error && (
                  <p className="rounded-lg bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-(--cta-primary) py-3 font-semibold text-(--text-inverted) transition hover:opacity-90 disabled:opacity-60"
                >
                  {busy ? "Entrando…" : "Entrar a editar"}
                </button>
              </form>
            )}
          </div>
        </main>
      </Container>
      <Footer />
    </>
  );
}
