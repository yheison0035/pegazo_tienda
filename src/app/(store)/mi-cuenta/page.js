"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Container from "@/components/layout/container";
import ProductCard from "@/components/layout/catalog/catalogSection/productCard";
import { useCustomer } from "@/context/customerContext";
import { useEditMode } from "@/context/editModeContext";
import { useFavorites } from "@/context/favoritesContext";
import {
  TextField,
  PasswordField,
  SubmitButton,
  validators,
} from "@/components/auth/authFields";
import GoogleButton from "@/components/auth/googleButton";
import {
  UserCircleIcon,
  ShoppingBagIcon,
  ArrowRightStartOnRectangleIcon,
  IdentificationIcon,
  PencilSquareIcon,
  HeartIcon,
  TruckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const websiteDomain =
  process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ||
  (typeof window !== "undefined" ? window.location.hostname : "");

const money = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const ORDER_STATUS = {
  NUEVA: "Nuevo",
  EN_PROCESO: "En proceso",
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobado",
  COMPLETADA: "Completado",
  DESPACHADA: "Despachado",
  ENTREGADA: "Entregado",
  CANCELADA: "Cancelado",
  RECHAZADA: "Rechazado",
  DEVUELTA: "Devuelto",
};

// Color del estado del pedido (tinte suave, legible en claro/oscuro).
const STATUS_STYLE = {
  NUEVA: "bg-(--brand-accent)/15 text-(--brand-accent)",
  EN_PROCESO: "bg-(--brand-accent)/15 text-(--brand-accent)",
  PENDIENTE: "bg-(--warning)/15 text-(--warning)",
  APROBADA: "bg-(--success)/15 text-(--success)",
  COMPLETADA: "bg-(--success)/15 text-(--success)",
  DESPACHADA: "bg-(--brand-accent)/15 text-(--brand-accent)",
  ENTREGADA: "bg-(--success)/15 text-(--success)",
  CANCELADA: "bg-(--danger)/15 text-(--danger)",
  RECHAZADA: "bg-(--danger)/15 text-(--danger)",
  DEVUELTA: "bg-(--danger)/15 text-(--danger)",
};

// Estados que dan por FINALIZADO el pedido (van a "Compras realizadas").
// El resto (nueva, en proceso, aprobada, despachada…) son "Compras en curso".
const FINAL_STATUSES = ["ENTREGADA", "CANCELADA", "RECHAZADA", "DEVUELTA"];

// Estado del ENVÍO (lo que más le interesa al cliente en curso).
const SHIP_STATUS = {
  PENDIENTE: { label: "Preparando tu pedido", style: "bg-(--bg-soft) text-(--text-muted)" },
  ASIGNADO_TRANSPORTADORA: { label: "Despachado", style: "bg-(--brand-accent)/15 text-(--brand-accent)" },
  EN_CAMINO: { label: "En camino", style: "bg-(--brand-accent)/15 text-(--brand-accent)" },
  ENTREGADO: { label: "Entregado", style: "bg-(--success)/15 text-(--success)" },
  DEVUELTO: { label: "Devuelto", style: "bg-(--danger)/15 text-(--danger)" },
  FALLIDO: { label: "Entrega fallida", style: "bg-(--danger)/15 text-(--danger)" },
};

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

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
  const { setEditToken } = useEditMode();
  const router = useRouter();
  const [mode, setMode] = useState("login"); // 'login' | 'register' | 'forgot' | 'owner'
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
      return mode === "login" || mode === "owner"
        ? validators.loginPassword(value)
        : validators.password(value);
    if (k === "phone") return validators.phone(value);
    return "";
  }

  function validateAll() {
    const keys =
      mode === "login" || mode === "owner"
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
      if (mode === "owner") {
        // Login del DUEÑO con sus credenciales del CRM → modo edición.
        const res = await fetch(`${API_URL}/website/owner/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Website-Domain": websiteDomain,
          },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "No se pudo iniciar sesión.");
        setEditToken(data.token);
        router.push("/");
        return;
      }
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
      {(mode === "login" || mode === "register") && (
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

      {mode === "owner" && (
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-(--brand-accent)/10 p-3">
          <PencilSquareIcon className="h-5 w-5 flex-none text-(--brand-accent)" />
          <p className="text-sm text-(--text-secondary)">
            <b>Administrar mi tienda.</b> Ingresa con las mismas credenciales que
            usas en el CRM para editar los textos de tu tienda.
          </p>
        </div>
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
              mode === "login" || mode === "owner"
                ? "current-password"
                : "new-password"
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
              : mode === "owner"
                ? "Entrar a editar"
                : "Enviar enlace"}
        </SubmitButton>
      </form>

      {mode === "forgot" && (
        <p className="mt-4 text-center text-sm text-(--text-muted)">
          <LinkButton onClick={() => switchMode("login")}>
            Volver a iniciar sesión
          </LinkButton>
        </p>
      )}

      {mode === "owner" && (
        <p className="mt-4 text-center text-sm text-(--text-muted)">
          <LinkButton onClick={() => switchMode("login")}>
            Volver al inicio de sesión de clientes
          </LinkButton>
        </p>
      )}

      {(mode === "login" || mode === "register") && (
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

          {mode === "login" && (
            <p className="mt-4 border-t border-(--border-soft) pt-4 text-center text-sm text-(--text-muted)">
              <LinkButton onClick={() => switchMode("owner")}>
                ¿Administras esta tienda? Ingresa para editarla
              </LinkButton>
            </p>
          )}
        </>
      )}
    </div>
  );
}

function OrderCard({ o }) {
  const ship = o.source === "ECOMMERCE" ? SHIP_STATUS[o.shippingStatus] : null;
  return (
    <li className="rounded-xl border border-(--border-soft) p-4 transition hover:border-(--border-strong) hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-(--text-primary)">{o.code}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            STATUS_STYLE[o.saleStatus] || "bg-(--bg-soft) text-(--text-muted)"
          }`}
        >
          {ORDER_STATUS[o.saleStatus] || o.saleStatus}
        </span>
      </div>
      {/* Estado del envío (solo pedidos de la tienda online) */}
      {ship && (
        <div className="mt-2 flex items-center gap-1.5">
          <TruckIcon className="h-4 w-4 text-(--text-muted)" />
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ship.style}`}
          >
            {ship.label}
          </span>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-(--text-muted)">
          {o.saleDate
            ? new Date(o.saleDate).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : ""}
        </span>
        <span className="font-bold text-(--text-primary)">
          {money(o.totalAmount)}
        </span>
      </div>
    </li>
  );
}

function ProfileForm() {
  const { customer, updateProfile } = useCustomer();
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
    <section className="mx-auto max-w-xl rounded-2xl border border-(--border-soft) bg-(--bg-page) p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <IdentificationIcon className="h-5 w-5 text-(--brand-accent)" />
        <h2 className="text-lg font-bold text-(--text-primary)">Mis datos</h2>
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
          className="w-full cursor-pointer rounded-xl bg-(--cta-primary) px-5 py-3 font-semibold text-(--text-inverted) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}

function OrdersView({ orders }) {
  const enCurso = orders.filter((o) => !FINAL_STATUSES.includes(o.saleStatus));
  const realizadas = orders.filter((o) => FINAL_STATUSES.includes(o.saleStatus));

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-(--border-soft) bg-(--bg-soft) px-4 py-16 text-center">
        <ShoppingBagIcon className="h-10 w-10 text-(--text-muted)" />
        <p className="text-sm text-(--text-muted)">Todavía no tienes pedidos.</p>
        <a
          href="/"
          className="rounded-lg bg-(--cta-primary) px-4 py-2 text-sm font-semibold text-(--text-inverted) transition hover:opacity-90"
        >
          Empezar a comprar
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* En curso */}
      <section className="rounded-2xl border border-(--border-soft) bg-(--bg-page) p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-(--brand-accent)" />
          <h2 className="text-base font-bold text-(--text-primary)">
            Compras en curso
          </h2>
          <span className="ml-auto rounded-full bg-(--bg-soft) px-2 py-0.5 text-xs font-semibold text-(--text-muted)">
            {enCurso.length}
          </span>
        </div>
        {enCurso.length === 0 ? (
          <p className="rounded-xl border border-dashed border-(--border-soft) bg-(--bg-soft) px-4 py-8 text-center text-sm text-(--text-muted)">
            No tienes compras en curso.
          </p>
        ) : (
          <ul className="space-y-3">
            {enCurso.map((o) => (
              <OrderCard key={o.id} o={o} />
            ))}
          </ul>
        )}
      </section>

      {/* Realizadas */}
      <section className="rounded-2xl border border-(--border-soft) bg-(--bg-page) p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingBagIcon className="h-5 w-5 text-(--success)" />
          <h2 className="text-base font-bold text-(--text-primary)">
            Compras realizadas
          </h2>
          <span className="ml-auto rounded-full bg-(--bg-soft) px-2 py-0.5 text-xs font-semibold text-(--text-muted)">
            {realizadas.length}
          </span>
        </div>
        {realizadas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-(--border-soft) bg-(--bg-soft) px-4 py-8 text-center text-sm text-(--text-muted)">
            Aún no tienes compras finalizadas.
          </p>
        ) : (
          <ul className="space-y-3">
            {realizadas.map((o) => (
              <OrderCard key={o.id} o={o} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FavoritesView() {
  const { favorites, listLoading, loadFavorites } = useFavorites();

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  if (listLoading && favorites.length === 0) {
    return (
      <p className="py-16 text-center text-(--text-muted)">
        Cargando tus favoritos…
      </p>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-(--border-soft) bg-(--bg-soft) px-4 py-16 text-center">
        <HeartIcon className="h-10 w-10 text-(--text-muted)" />
        <p className="text-sm text-(--text-muted)">
          Todavía no has guardado favoritos. Toca el corazón en un producto para
          guardarlo aquí.
        </p>
        <a
          href="/"
          className="rounded-lg bg-(--cta-primary) px-4 py-2 text-sm font-semibold text-(--text-inverted) transition hover:opacity-90"
        >
          Explorar productos
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {favorites.map((p) => (
        <ProductCard key={p.id} product={p} category={p.category} />
      ))}
    </div>
  );
}

function AccountPanel({ initialTab = "orders" }) {
  const { customer, orders, logout } = useCustomer();
  const { count } = useFavorites();
  const [tab, setTab] = useState(initialTab);

  const tabs = [
    { key: "orders", label: "Mis compras", Icon: ShoppingBagIcon },
    { key: "favorites", label: "Favoritos", Icon: HeartIcon, badge: count },
    { key: "profile", label: "Mis datos", Icon: IdentificationIcon },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Cabecera de perfil */}
      <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-(--brand-primary) to-(--brand-secondary) p-6 text-(--text-inverted) shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-white/15 text-2xl font-bold ring-2 ring-white/30">
            {initials(customer?.name) || <UserCircleIcon className="h-9 w-9" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold">
              {customer?.name || "Mi cuenta"}
            </p>
            <p className="truncate text-sm opacity-90">{customer?.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
              {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/25"
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>

      {/* Pestañas */}
      <div className="flex gap-1 rounded-xl border border-(--border-soft) bg-(--bg-page) p-1 shadow-sm">
        {tabs.map(({ key, label, Icon, badge }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-semibold transition cursor-pointer ${
              tab === key
                ? "bg-(--brand-accent) text-white"
                : "text-(--text-muted) hover:bg-(--bg-soft) hover:text-(--text-primary)"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{label}</span>
            {badge ? (
              <span
                className={`ml-0.5 rounded-full px-1.5 text-[10px] font-bold ${
                  tab === key
                    ? "bg-white/25 text-white"
                    : "bg-(--brand-accent)/15 text-(--brand-accent)"
                }`}
              >
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "orders" && <OrdersView orders={orders} />}
      {tab === "favorites" && <FavoritesView />}
      {tab === "profile" && <ProfileForm />}
    </div>
  );
}

export default function MiCuentaPage() {
  const { isAuthenticated, loading } = useCustomer();
  const router = useRouter();
  const [initialTab, setInitialTab] = useState("orders");
  const [fromFav, setFromFav] = useState(false);

  // Leer parámetros de la URL una sola vez (pestaña inicial y flujo de favorito).
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const tab = p.get("tab");
      if (tab === "favoritos" || tab === "favorites") setInitialTab("favorites");
      if (p.get("favorito") === "1") setFromFav(true);
    } catch {
      /* noop */
    }
  }, []);

  // Si el cliente llegó desde el corazón (sin sesión) y ya inició sesión,
  // lo devolvemos a donde estaba para que retome su compra.
  useEffect(() => {
    if (loading || !isAuthenticated || !fromFav) return;
    try {
      const p = new URLSearchParams(window.location.search);
      const back = p.get("redirect");
      if (back) {
        const dest = decodeURIComponent(back);
        if (dest.startsWith("/")) router.replace(dest);
      }
    } catch {
      /* noop */
    }
  }, [loading, isAuthenticated, fromFav, router]);

  return (
    <>
      <Header />
      <Container>
        <main className="px-4 pb-16 md:pt-49 pt-70">
          {loading ? (
            <p className="py-16 text-center text-(--text-muted)">Cargando…</p>
          ) : isAuthenticated ? (
            <AccountPanel initialTab={fromFav ? "favorites" : initialTab} />
          ) : (
            <div className="mx-auto w-full max-w-md">
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-(--text-primary)">
                  Mi cuenta
                </h1>
                <p className="mt-1 text-sm text-(--text-muted)">
                  Inicia sesión para ver tus pedidos y datos.
                </p>
              </div>
              <div className="rounded-2xl border border-(--border-soft) bg-(--bg-page) p-6 shadow-sm sm:p-8">
                <AuthPanel />
              </div>
            </div>
          )}
        </main>
      </Container>
      <Footer />
    </>
  );
}
