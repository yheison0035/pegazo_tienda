"use client";

import { useEffect, useState } from "react";
import { MapPinIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useCustomer } from "@/context/customerContext";
import { getAddresses } from "@/lib/utils/api/routes/addresses";
import { formatText } from "@/lib/api/utils/utils";

// Selector de direcciones guardadas del cliente en el checkout. Si no hay sesión
// o no hay direcciones, no se muestra nada. Al elegir una, se cargan sus datos
// en el formulario del checkout.
export default function SavedAddresses({ selectedAddress, onPick }) {
  const { isAuthenticated } = useCustomer();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAddresses([]);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const res = await getAddresses();
        if (alive) setAddresses(res?.data || []);
      } catch {
        if (alive) setAddresses([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || addresses.length === 0) return null;

  return (
    <div className="mb-5 rounded-xl border border-(--border-soft) bg-(--bg-soft) p-3">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-(--text-primary)">
        <MapPinIcon className="h-4 w-4 text-(--brand-accent)" />
        Usar una dirección guardada
      </p>
      <div className="flex flex-col gap-2">
        {addresses.map((a) => {
          const active = selectedAddress === a.address;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onPick(a)}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                active
                  ? "border-(--brand-accent) bg-(--bg-page)"
                  : "border-(--border-soft) bg-(--bg-page) hover:border-(--brand-accent)"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border ${
                  active
                    ? "border-(--brand-accent) bg-(--brand-accent) text-white"
                    : "border-(--border-strong)"
                }`}
              >
                {active && <CheckIcon className="h-3.5 w-3.5" />}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-(--text-primary)">
                    {a.label || "Dirección"}
                  </span>
                  {a.isDefault && (
                    <span className="rounded-full bg-(--success)/15 px-2 py-0.5 text-[10px] font-semibold text-(--success)">
                      Predeterminada
                    </span>
                  )}
                </span>
                <span className="block text-sm text-(--text-primary)">
                  {a.address}
                </span>
                <span className="block text-xs text-(--text-muted)">
                  {formatText(a.neighborhood)} · {formatText(a.city)},{" "}
                  {formatText(a.department)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
