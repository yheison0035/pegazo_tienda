"use client";

import { useEffect } from "react";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEditMode } from "@/context/editModeContext";

// Barra visible SOLO para el dueño en modo edición. Empuja el header y el
// contenido hacia abajo su propia altura para no taparlos.
export default function EditBar() {
  const { isEditing, logoutEdit } = useEditMode();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isEditing) {
      root.style.setProperty("--edit-bar-h", "2.5rem");
      body.style.paddingTop = "2.5rem";
    } else {
      root.style.setProperty("--edit-bar-h", "0px");
      body.style.paddingTop = "";
    }
    return () => {
      root.style.setProperty("--edit-bar-h", "0px");
      body.style.paddingTop = "";
    };
  }, [isEditing]);

  if (!isEditing) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex h-10 items-center justify-center gap-2 bg-(--brand-primary) px-3 text-sm font-medium text-(--text-inverted) shadow">
      <PencilSquareIcon className="h-5 w-5 flex-none" />
      <span className="truncate">
        <span className="hidden sm:inline">Modo edición: </span>puedes editar los
        textos de tu tienda.
      </span>
      <button
        onClick={logoutEdit}
        className="ml-1 inline-flex flex-none items-center gap-1 rounded-full bg-white/15 px-3 py-0.5 text-xs transition hover:bg-white/25"
      >
        <XMarkIcon className="h-4 w-4" />
        Salir
      </button>
    </div>
  );
}
