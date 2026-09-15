"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon, MapPinIcon, CheckIcon } from "@heroicons/react/24/outline";

// Tipos de vía comunes en Colombia.
const ROAD_TYPES = [
  "CALLE",
  "CARRERA",
  "AVENIDA",
  "AVENIDA CALLE",
  "AVENIDA CARRERA",
  "DIAGONAL",
  "TRANSVERSAL",
  "CIRCULAR",
  "MANZANA",
  "VÍA",
];

const up = (s) => String(s || "").toUpperCase();

// Arma la dirección a partir de las partes, en formato colombiano.
function buildAddress({ roadType, road, cross, plate, complement }) {
  if (!road && !cross && !plate) return "";
  let base = `${roadType} ${up(road)}`.trim();
  if (cross) base += ` # ${up(cross)}`;
  if (plate) base += ` - ${up(plate)}`;
  if (complement) base += `, ${up(complement)}`;
  return base.replace(/\s+/g, " ").trim();
}

/**
 * Armador de dirección DIDÁCTICO: el cliente llena partes simples (tipo de vía,
 * números y complemento) y ve la dirección final formándose en tiempo real. Así
 * se evita el error más común: direcciones mal escritas. Todo en MAYÚSCULA.
 */
export default function AddressBuilder({ open, onClose, onConfirm }) {
  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState({
    roadType: "CALLE",
    road: "",
    cross: "",
    plate: "",
    complement: "",
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const preview = buildAddress(parts);
  const set = (k) => (e) => setParts((p) => ({ ...p, [k]: e.target.value }));

  const confirm = () => {
    if (!preview) return;
    onConfirm(preview);
    onClose();
  };

  if (!open || !mounted) return null;

  const inputCls =
    "w-full rounded-xl border border-(--border-soft) px-3 py-2.5 text-center text-(--text-primary) uppercase outline-none transition focus:border-(--brand-accent) focus:ring-2 focus:ring-(--brand-accent)/30";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-(--bg-page) shadow-2xl sm:rounded-3xl"
        >
          {/* Cabecera */}
          <div className="flex items-start justify-between gap-3 bg-gradient-to-br from-(--brand-primary) to-(--brand-secondary) px-6 py-5 text-(--text-inverted)">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <MapPinIcon className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold leading-tight">
                  Arma tu dirección
                </h2>
                <p className="text-sm opacity-90">
                  Llena las casillas y revisa cómo queda abajo
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-full p-1.5 transition hover:bg-white/15"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-5 p-6">
            {/* Tipo de vía */}
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
                Tipo de vía
              </label>
              <select
                value={parts.roadType}
                onChange={set("roadType")}
                className="w-full rounded-xl border border-(--border-soft) bg-(--bg-page) px-3 py-2.5 text-(--text-primary) outline-none transition focus:border-(--brand-accent) focus:ring-2 focus:ring-(--brand-accent)/30"
              >
                {ROAD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Números guiados: VÍA  #  CRUCE  -  PLACA */}
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-2">
              <div>
                <label className="mb-1 block text-center text-xs font-medium text-(--text-muted)">
                  Vía
                </label>
                <input
                  value={parts.road}
                  onChange={set("road")}
                  placeholder="45"
                  inputMode="text"
                  className={inputCls}
                />
              </div>
              <span className="pb-2.5 text-lg font-bold text-(--text-muted)">
                #
              </span>
              <div>
                <label className="mb-1 block text-center text-xs font-medium text-(--text-muted)">
                  Número
                </label>
                <input
                  value={parts.cross}
                  onChange={set("cross")}
                  placeholder="12"
                  className={inputCls}
                />
              </div>
              <span className="pb-2.5 text-lg font-bold text-(--text-muted)">
                −
              </span>
              <div>
                <label className="mb-1 block text-center text-xs font-medium text-(--text-muted)">
                  Placa
                </label>
                <input
                  value={parts.plate}
                  onChange={set("plate")}
                  placeholder="34"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Complemento */}
            <div>
              <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
                Apto / Torre / Casa / Interior{" "}
                <span className="text-(--text-muted)">(opcional)</span>
              </label>
              <input
                value={parts.complement}
                onChange={set("complement")}
                placeholder="APTO 501, TORRE 3"
                className="w-full rounded-xl border border-(--border-soft) px-3 py-2.5 uppercase text-(--text-primary) outline-none transition focus:border-(--brand-accent) focus:ring-2 focus:ring-(--brand-accent)/30"
              />
            </div>

            {/* Vista previa en tiempo real */}
            <div className="rounded-2xl border-2 border-dashed border-(--brand-accent)/40 bg-(--bg-soft) p-4 text-center">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-(--text-muted)">
                Tu dirección quedará así
              </p>
              <p className="text-lg font-bold text-(--text-primary)">
                {preview || "…"}
              </p>
            </div>
          </div>

          {/* Pie */}
          <div className="flex items-center justify-end gap-3 border-t border-(--border-soft) p-4">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-(--text-secondary) transition hover:bg-(--bg-soft)"
            >
              Cancelar
            </button>
            <button
              onClick={confirm}
              disabled={!preview}
              className="inline-flex items-center gap-2 rounded-xl bg-(--cta-primary) px-5 py-2.5 text-sm font-semibold text-(--text-inverted) transition hover:opacity-90 disabled:opacity-50"
            >
              <CheckIcon className="h-5 w-5" />
              Usar esta dirección
            </button>
          </div>
        </div>
      </div>
    </div>,
    window.document.body,
  );
}
