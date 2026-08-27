"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Container from "@/components/layout/container";
import { useCustomer } from "@/context/customerContext";
import {
  TextField,
  PasswordField,
  SubmitButton,
  validators,
} from "@/components/auth/authFields";
import GoogleButton from "@/components/auth/googleButton";

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

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-semibold transition ${
        active
          ? "bg-(--brand-accent) text-white"
          : "text-(--text-muted) hover:text-(--text-primary)"
      }`}
    >
      {children}
    </button>
  );
}

function LinkButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer font-semibold text-(--brand-accent) hover:underline"
    >
      {children}
    </button>
  );
}

function AuthPanel() {
  const { login, register, forgotPassword } = useCustomer();
  const [mode, setMode] = useState("login"); // 'login' | 'register' | 'forgot'
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (touched[k]) setErrors((er) => ({ ...er, [k]: fieldError(k, value) }));
  };
  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((er) => ({ ...er, [k]: fieldError(k, form[k]) }));
  };

  function fieldError(k, value) {
    if (k === "name") return mode === "register" ? validators.name(value) : "";
    if (k === "email") return validators.email(value);
    if (k === "password")
      return mode === "login"
        ? validators.loginPassword(value)
        : validators.password(value);
    if (k === "phone") return validators.phone(value);
    return "";
  }

  function validateAll() {
    const keys =
      mode === "login"
        ? ["email", "password"]
        : mode === "forgot"
          ? ["email"]
          : ["name", "email", "password", "phone"];
    const next = {};
    keys.forEach((k) => {
      const e = fieldError(k, form[k]);
      if (e) next[k] = e;
    });
    setErrors(next);
    setTouched(Object.fromEntries(keys.map((k) => [k, true])));
    return Object.keys(next).length === 0;
  }

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setTouched({});
    setFormError("");
    setOk("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    setOk("");
    if (!validateAll()) return;
    setBusy(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else if (mode === "register") {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        });
      } else {
        const res = await forgotPassword(form.email);
        setOk(
          res?.message ||
            "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.",
        );
      }
    } catch (err) {
      setFormError(err?.message || "No se pudo completar. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  // Si Google devolvió un error, mostrarlo (?gerror=1 en la URL).
  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("gerror")) {
        setFormError("No se pudo entrar con Google. Intenta de nuevo.");
        const url = new URL(window.location.href);
        url.searchParams.delete("gerror");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    } catch {
      /* noop */
    }
  }, []);

  return (
    <div className="mx-auto w-full max-w-md">
      {mode !== "forgot" && (
        <div className="mb-6 flex rounded-xl border border-(--border-soft) p-1">
          <TabButton
            active={mode === "login"}
            onClick={() => switchMode("login")}
          >
            Iniciar sesión
          </TabButton>
          <TabButton
            active={mode === "register"}
            onClick={() => switchMode("register")}
          >
            Crear cuenta
          </TabButton>
        </div>
      )}

      {mode === "forgot" && (
        <p className="mb-5 text-center text-sm text-(--text-muted)">
          Escribe tu correo y te enviaremos un enlace para crear una nueva
          contraseña.
        </p>
      )}

      <form onSubmit={submit} noValidate className="space-y-4">
        {mode === "register" && (
          <TextField
            label="Nombre completo"
            type="text"
            value={form.name}
            onChange={set("name")}
            onBlur={blur("name")}
            error={touched.name && errors.name}
            autoComplete="name"
          />
        )}

        <TextField
          label="Correo electrónico"
          type="email"
          value={form.email}
          onChange={set("email")}
          onBlur={blur("email")}
          error={touched.email && errors.email}
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
        />

        {mode !== "forgot" && (
          <PasswordField
            label="Contraseña"
            value={form.password}
            onChange={set("password")}
            onBlur={blur("password")}
            error={touched.password && errors.password}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            hint={mode === "register" ? "Mínimo 6 caracteres." : undefined}
          />
        )}

        {mode === "register" && (
          <TextField
            label="Teléfono (opcional)"
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={set("phone")}
            onBlur={blur("phone")}
            error={touched.phone && errors.phone}
            autoComplete="tel"
          />
        )}

        {mode === "login" && (
          <div className="text-right">
            <LinkButton onClick={() => switchMode("forgot")}>
              ¿Olvidaste tu contraseña?
            </LinkButton>
          </div>
        )}

        {formError && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {formError}
          </p>
        )}
        {ok && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
            {ok}
          </p>
        )}

        <SubmitButton loading={busy}>
          {mode === "login"
            ? "Entrar"
            : mode === "register"
              ? "Crear mi cuenta"
              : "Enviar enlace"}
        </SubmitButton>
      </form>

      {mode === "forgot" ? (
        <p className="mt-4 text-center text-sm text-(--text-muted)">
          <LinkButton onClick={() => switchMode("login")}>
            Volver a iniciar sesión
          </LinkButton>
        </p>
      ) : (
        <>
          <div className="mt-5">
            <GoogleButton
              text={
                mode === "register"
                  ? "Registrarme con Google"
                  : "Continuar con Google"
              }
            />
          </div>
          <p className="mt-5 text-center text-sm text-(--text-muted)">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <LinkButton onClick={() => switchMode("register")}>
                  Créala aquí
                </LinkButton>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <LinkButton onClick={() => switchMode("login")}>
                  Inicia sesión
                </LinkButton>
              </>
            )}
          </p>
        </>
      )}
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
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    const nameErr = validators.name(form.name);
    const phoneErr = validators.phone(form.phone);
    const next = {};
    if (nameErr) next.name = nameErr;
    if (phoneErr) next.phone = phoneErr;
    setErrors(next);
    if (Object.keys(next).length) return;
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
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-(--text-primary)">Mis datos</h2>
          <button
            type="button"
            onClick={logout}
            className="cursor-pointer text-sm font-medium text-(--text-muted) hover:text-(--brand-accent)"
          >
            Cerrar sesión
          </button>
        </div>
        <form onSubmit={save} noValidate className="space-y-4">
          <TextField
            label="Nombre completo"
            type="text"
            value={form.name}
            onChange={set("name")}
            error={errors.name}
          />
          <TextField
            label="Correo electrónico"
            type="email"
            value={customer?.email || ""}
            disabled
            readOnly
            className="cursor-not-allowed opacity-70"
          />
          <TextField
            label="Teléfono"
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={set("phone")}
            error={errors.phone}
          />
          <TextField
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
            className="cursor-pointer rounded-xl bg-(--cta-primary) px-5 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </section>

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
