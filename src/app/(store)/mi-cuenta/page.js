"use client";

import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Container from "@/components/layout/container";
import { useCustomer } from "@/context/customerContext";

const money = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const ORDER_STATUS = {
  NUEVA: "Nuevo",
  EN_PROCESO: "En proceso",
  COMPLETADA: "Completado",
  CANCELADA: "Cancelado",
  RECHAZADA: "Rechazado",
  DEVUELTA: "Devuelto",
};

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-(--text-primary)">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-(--border-soft) bg-(--bg-page) px-3 py-2.5 text-(--text-primary) outline-none transition focus:border-(--brand-accent)"
      />
    </label>
  );
}

function AuthPanel() {
  const { login, register } = useCustomer();
  const [tab, setTab] = useState("login"); // 'login' | 'register'
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (tab === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        });
      }
    } catch (err) {
      setError(err?.message || "No se pudo completar. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 flex rounded-xl border border-(--border-soft) p-1">
        {[
          ["login", "Iniciar sesión"],
          ["register", "Crear cuenta"],
        ].map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setTab(v);
              setError("");
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              tab === v
                ? "bg-(--brand-accent) text-white"
                : "text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {tab === "register" && (
          <Field
            label="Nombre completo"
            type="text"
            required
            value={form.name}
            onChange={set("name")}
            autoComplete="name"
          />
        )}
        <Field
          label="Correo electrónico"
          type="email"
          required
          value={form.email}
          onChange={set("email")}
          autoComplete="email"
        />
        <Field
          label="Contraseña"
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={set("password")}
          autoComplete={tab === "login" ? "current-password" : "new-password"}
        />
        {tab === "register" && (
          <Field
            label="Teléfono (opcional)"
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            autoComplete="tel"
          />
        )}

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-(--cta-primary) py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {busy
            ? "Un momento…"
            : tab === "login"
              ? "Entrar"
              : "Crear mi cuenta"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-(--text-muted)">
        {tab === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => setTab("register")}
              className="font-semibold text-(--brand-accent) hover:underline"
            >
              Créala aquí
            </button>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => setTab("login")}
              className="font-semibold text-(--brand-accent) hover:underline"
            >
              Inicia sesión
            </button>
          </>
        )}
      </p>
    </div>
  );
}

function AccountPanel() {
  const { customer, orders, updateProfile, logout } = useCustomer();
  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    documentNumber: customer?.document || "",
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        documentNumber: form.documentNumber,
      });
      setMsg("Datos actualizados.");
    } catch (err) {
      setMsg(err?.message || "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8 md:grid-cols-2">
      {/* Perfil */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-(--text-primary)">Mis datos</h2>
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-(--text-muted) hover:text-(--brand-accent)"
          >
            Cerrar sesión
          </button>
        </div>
        <form onSubmit={save} className="space-y-4">
          <Field
            label="Nombre completo"
            type="text"
            value={form.name}
            onChange={set("name")}
          />
          <Field
            label="Correo electrónico"
            type="email"
            value={customer?.email || ""}
            disabled
            readOnly
          />
          <Field
            label="Teléfono"
            type="tel"
            value={form.phone}
            onChange={set("phone")}
          />
          <Field
            label="Documento"
            type="text"
            value={form.documentNumber}
            onChange={set("documentNumber")}
          />
          {msg && (
            <p className="rounded-lg bg-(--bg-soft) px-3 py-2 text-sm text-(--text-primary)">
              {msg}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-(--cta-primary) px-5 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </section>

      {/* Pedidos */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-(--text-primary)">
          Mis pedidos
        </h2>
        {orders.length === 0 ? (
          <p className="rounded-xl border border-(--border-soft) bg-(--bg-soft) p-4 text-sm text-(--text-muted)">
            Todavía no tienes pedidos.
          </p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border border-(--border-soft) p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-(--text-primary)">
                    {o.code}
                  </span>
                  <span className="font-bold text-(--brand-accent)">
                    {money(o.totalAmount)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-(--text-muted)">
                  <span>
                    {o.saleDate
                      ? new Date(o.saleDate).toLocaleDateString("es-CO")
                      : ""}
                  </span>
                  <span className="rounded-full bg-(--bg-soft) px-2 py-0.5 font-medium">
                    {ORDER_STATUS[o.saleStatus] || o.saleStatus}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function MiCuentaPage() {
  const { isAuthenticated, loading } = useCustomer();

  return (
    <>
      <Header />
      <Container>
        <main className="px-4 pb-16 md:pt-49 pt-70">
          <h1 className="mb-8 text-center text-3xl font-bold text-(--text-primary)">
            Mi cuenta
          </h1>
          {loading ? (
            <p className="py-16 text-center text-(--text-muted)">Cargando…</p>
          ) : isAuthenticated ? (
            <AccountPanel />
          ) : (
            <AuthPanel />
          )}
        </main>
      </Container>
      <Footer />
    </>
  );
}
