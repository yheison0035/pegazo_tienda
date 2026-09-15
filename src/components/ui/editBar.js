"use client";

import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEditMode } from "@/context/editModeContext";

// Barra visible SOLO para el dueño en modo edición.
export default function EditBar() {
  const { isEditing, logoutEdit } = useEditMode();
  if (!isEditing) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[90] flex items-center justify-center gap-3 bg-(--brand-primary) px-4 py-2 text-sm font-medium text-(--text-inverted) shadow">
      <PencilSquareIcon className="h-5 w-5" />
      <span>Modo edición: puedes editar los textos de tu tienda.</span>
      <button
        onClick={logoutEdit}
        className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-0.5 text-xs transition hover:bg-white/25"
      >
        <XMarkIcon className="h-4 w-4" />
        Salir
      </button>
    </div>
  );
}
