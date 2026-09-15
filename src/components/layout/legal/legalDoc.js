"use client";

import { useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import RichHtml from "@/components/ui/richHtml";
import RichTextEditor from "@/components/ui/richTextEditor";
import { useEditMode } from "@/context/editModeContext";

export default function LegalDoc({ slug, title: initialTitle, html: initialHtml }) {
  const { isEditing, saveLegal } = useEditMode();
  const [title, setTitle] = useState(initialTitle || "");
  const [html, setHtml] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await saveLegal({ slug, title, html });
      setMsg({ type: "ok", text: "Cambios guardados." });
    } catch (e) {
      setMsg({ type: "err", text: e.message || "No se pudo guardar." });
    } finally {
      setSaving(false);
    }
  };

  // Modo edición (solo el dueño): título editable + editor enriquecido.
  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-(--brand-accent) bg-(--brand-accent)/5 px-3 py-2 text-xs font-medium text-(--brand-accent)">
          Estás editando este documento (solo tú lo ves en modo edición).
        </div>
        <div>
          <label className="mb-1 block text-sm text-(--text-muted)">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-(--border-soft) bg-(--bg-page) px-4 py-2 text-lg font-bold text-(--text-primary) outline-none focus:ring-2 focus:ring-(--brand-accent)/30"
          />
        </div>
        <RichTextEditor
          value={html}
          onChange={setHtml}
          placeholder="Escribe aquí el contenido de este documento…"
          minHeight={320}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-(--cta-primary) px-5 py-2.5 font-semibold text-(--text-inverted) transition hover:opacity-90 disabled:opacity-60"
          >
            <CheckIcon className="h-5 w-5" />
            {saving ? "Guardando…" : "Guardar"}
          </button>
          {msg && (
            <span
              className={`text-sm ${
                msg.type === "err" ? "text-(--danger)" : "text-(--success)"
              }`}
            >
              {msg.text}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Vista normal (visitantes).
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold text-(--text-primary)">{title}</h1>
      {html ? (
        <div className="text-base leading-relaxed text-(--text-secondary)">
          <RichHtml html={html} />
        </div>
      ) : (
        <p className="text-(--text-muted)">
          Este documento aún no tiene contenido publicado.
        </p>
      )}
    </>
  );
}
