"use client";

import { useEffect, useState } from "react";
import {
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import DepartaCiudad from "@/components/ui/select/depart_ciud";
import AddressBuilder from "@/components/layout/checkout/components/addressBuilder";
import { formatText } from "@/lib/api/utils/utils";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/lib/utils/api/routes/addresses";

const EMPTY = {
  label: "",
  department: "",
  city: "",
  address: "",
  neighborhood: "",
  addressDetail: "",
  isDefault: false,
};

// Campos que van en MAYÚSCULA (igual que el checkout).
const UPPER = new Set(["neighborhood", "addressDetail"]);

const inputCls =
  "w-full rounded-xl border border-(--border-soft) bg-(--bg-page) px-3 py-2.5 text-(--text-primary) outline-none transition focus:border-(--brand-accent) focus:ring-2 focus:ring-(--brand-accent)/30";

function AddressForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [addrOpen, setAddrOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (typeof v === "string" && UPPER.has(name)) v = v.toUpperCase();
    setForm((f) => ({ ...f, [name]: v }));
  };

  const save = async () => {
    setError("");
    if (!form.department || !form.city) {
      setError("Selecciona departamento y ciudad.");
      return;
    }
    if (!form.address) {
      setError("Arma tu dirección con el asistente.");
      return;
    }
    if (!form.neighborhood?.trim()) {
      setError("El barrio es obligatorio.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        label: form.label?.trim() || undefined,
        department: form.department,
        city: form.city,
        neighborhood: form.neighborhood,
        address: form.address,
        addressDetail: form.addressDetail || undefined,
        isDefault: !!form.isDefault,
      };
      if (initial?.id) await updateAddress(initial.id, payload);
      else await createAddress(payload);
      onSaved();
    } catch (err) {
      setError(err?.message || "No se pudo guardar la dirección.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-(--border-soft) bg-(--bg-soft) p-4 sm:p-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
          Nombre de la dirección{" "}
          <span className="text-(--text-muted)">(opcional)</span>
        </label>
        <input
          name="label"
          value={form.label}
          onChange={handleChange}
          placeholder="Casa, Trabajo…"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-4">
        <DepartaCiudad
          formData={form}
          handleChange={handleChange}
          required
        />
      </div>

      {/* Dirección armada con el asistente (mismo del checkout) */}
      <div>
        <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
          Dirección <span className="text-(--danger)">*</span>
        </label>
        <button
          type="button"
          onClick={() => setAddrOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-(--border-soft) bg-(--bg-page) px-4 py-3 text-left transition hover:border-(--brand-accent)"
        >
          <MapPinIcon className="h-5 w-5 flex-none text-(--brand-accent)" />
          {form.address ? (
            <span className="flex-1 font-medium text-(--text-primary)">
              {form.address}
            </span>
          ) : (
            <span className="flex-1 text-(--text-muted)">
              Toca para armar tu dirección
            </span>
          )}
          <PencilSquareIcon className="h-5 w-5 flex-none text-(--text-muted)" />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
          Barrio <span className="text-(--danger)">*</span>
        </label>
        <input
          name="neighborhood"
          value={form.neighborhood}
          onChange={handleChange}
          className={`${inputCls} uppercase`}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
          Referencias para llegar{" "}
          <span className="text-(--text-muted)">(opcional)</span>
        </label>
        <input
          name="addressDetail"
          value={form.addressDetail}
          onChange={handleChange}
          placeholder="Ej: PORTÓN VERDE, CASA ESQUINERA"
          className={`${inputCls} uppercase`}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-(--text-secondary)">
        <input
          type="checkbox"
          name="isDefault"
          checked={form.isDefault}
          onChange={handleChange}
          className="cursor-pointer"
        />
        Usar como dirección predeterminada
      </label>

      {error && <p className="text-sm font-medium text-(--danger)">{error}</p>}

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-(--text-secondary) transition hover:bg-(--bg-muted)"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-xl bg-(--cta-primary) px-5 py-2.5 text-sm font-semibold text-(--text-inverted) transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Guardando…" : "Guardar dirección"}
        </button>
      </div>

      <AddressBuilder
        open={addrOpen}
        onClose={() => setAddrOpen(false)}
        onConfirm={(value) => setForm((f) => ({ ...f, address: value }))}
      />
    </div>
  );
}

export default function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // "new" | address obj | null

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAddresses();
      setAddresses(res?.data || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSaved = () => {
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar esta dirección?")) return;
    try {
      await deleteAddress(id);
      load();
    } catch {
      /* noop */
    }
  };

  return (
    <section className="rounded-2xl border border-(--border-soft) bg-(--bg-page) p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-(--brand-accent)" />
          <h2 className="text-lg font-bold text-(--text-primary)">
            Mis direcciones
          </h2>
        </div>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-(--cta-primary) px-3 py-2 text-sm font-semibold text-(--text-inverted) transition hover:opacity-90"
          >
            <PlusIcon className="h-4 w-4" />
            Agregar
          </button>
        )}
      </div>

      {/* Form nueva / edición */}
      {editing === "new" && (
        <div className="mb-4">
          <AddressForm onSaved={onSaved} onCancel={() => setEditing(null)} />
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-(--text-muted)">
          Cargando direcciones…
        </p>
      ) : addresses.length === 0 && editing !== "new" ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-(--border-soft) bg-(--bg-soft) px-4 py-10 text-center">
          <MapPinIcon className="h-9 w-9 text-(--text-muted)" />
          <p className="text-sm text-(--text-muted)">
            No tienes direcciones guardadas. Agrega una para cargarla al comprar.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {addresses.map((a) =>
            editing?.id === a.id ? (
              <li key={a.id}>
                <AddressForm
                  initial={{
                    label: a.label || "",
                    department: a.department || "",
                    city: a.city || "",
                    address: a.address || "",
                    neighborhood: a.neighborhood || "",
                    addressDetail: a.addressDetail || "",
                    isDefault: a.isDefault || false,
                    id: a.id,
                  }}
                  onSaved={onSaved}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-(--border-soft) p-4 transition hover:border-(--border-strong)"
              >
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-(--text-primary)">
                      {a.label || "Dirección"}
                    </span>
                    {a.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-(--success)/15 px-2 py-0.5 text-[11px] font-semibold text-(--success)">
                        <CheckBadgeIcon className="h-3.5 w-3.5" />
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-(--text-primary)">
                    {a.address}
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    {formatText(a.neighborhood)} · {formatText(a.city)},{" "}
                    {formatText(a.department)}
                  </p>
                  {a.addressDetail && (
                    <p className="mt-0.5 text-xs text-(--text-muted)">
                      Ref: {a.addressDetail}
                    </p>
                  )}
                </div>
                <div className="flex flex-none flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(a)}
                    aria-label="Editar"
                    className="rounded-lg p-2 text-(--text-muted) transition hover:bg-(--bg-soft) hover:text-(--brand-accent)"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    aria-label="Eliminar"
                    className="rounded-lg p-2 text-(--text-muted) transition hover:bg-(--danger)/10 hover:text-(--danger)"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
