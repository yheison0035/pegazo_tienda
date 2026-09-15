"use client";

import { useEffect, useRef, useState } from "react";
import {
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

// Editor enriquecido liviano (contentEditable + execCommand). Devuelve HTML.
export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Escribe aquí…",
  minHeight = 200,
}) {
  const ref = useRef(null);
  const [active, setActive] = useState({});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== (value || "")) el.innerHTML = value || "";
  }, [value]);

  const emit = () => {
    if (!ref.current || !onChange) return;
    const html = ref.current.innerHTML;
    onChange(html === "<br>" ? "" : html);
  };

  const refreshActive = () => {
    try {
      setActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
      });
    } catch {
      /* noop */
    }
  };

  const exec = (command, arg) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
    refreshActive();
  };

  const addLink = () => {
    const url = window.prompt("Pega el enlace (https://…):", "https://");
    if (!url) return;
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) exec("createLink", url);
    else
      exec(
        "insertHTML",
        `<a href="${url.replace(/"/g, "")}">${url.replace(/</g, "")}</a>`,
      );
  };

  const Btn = ({ onClick, isActive, title, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition ${
        isActive
          ? "bg-(--brand-accent)/15 text-(--brand-accent)"
          : "text-(--text-secondary) hover:bg-(--bg-soft)"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-xl border border-(--border-soft) bg-(--bg-page) focus-within:ring-2 focus-within:ring-(--brand-accent)/40">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-(--border-soft) px-2 py-1.5">
        <Btn onClick={() => exec("bold")} isActive={active.bold} title="Negrita">
          <span className="font-bold">B</span>
        </Btn>
        <Btn onClick={() => exec("italic")} isActive={active.italic} title="Cursiva">
          <span className="italic">I</span>
        </Btn>
        <Btn onClick={() => exec("underline")} isActive={active.underline} title="Subrayado">
          <span className="underline">U</span>
        </Btn>
        <span className="mx-1 h-5 w-px bg-(--border-soft)" />
        <Btn onClick={() => exec("insertUnorderedList")} isActive={active.insertUnorderedList} title="Viñetas">
          <ListBulletIcon className="h-5 w-5" />
        </Btn>
        <Btn onClick={() => exec("insertOrderedList")} isActive={active.insertOrderedList} title="Numerada">
          <NumberedListIcon className="h-5 w-5" />
        </Btn>
        <span className="mx-1 h-5 w-px bg-(--border-soft)" />
        <Btn onClick={() => exec("justifyLeft")} isActive={active.justifyLeft} title="Izquierda">
          <Bars3BottomLeftIcon className="h-5 w-5" />
        </Btn>
        <Btn onClick={() => exec("justifyCenter")} isActive={active.justifyCenter} title="Centrar">
          <Bars3Icon className="h-5 w-5" />
        </Btn>
        <Btn onClick={() => exec("justifyRight")} isActive={active.justifyRight} title="Derecha">
          <Bars3BottomRightIcon className="h-5 w-5" />
        </Btn>
        <span className="mx-1 h-5 w-px bg-(--border-soft)" />
        <Btn onClick={addLink} title="Enlace">
          <LinkIcon className="h-5 w-5" />
        </Btn>
        <Btn onClick={() => exec("removeFormat")} title="Quitar formato">
          <ArrowUturnLeftIcon className="h-5 w-5" />
        </Btn>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="rte-content max-w-none px-4 py-3 text-sm text-(--text-primary) outline-none"
      />

      <style>{`
        .rte-content:empty:before { content: attr(data-placeholder); color: var(--text-muted); }
        .rte-content a { color: var(--brand-accent); text-decoration: underline; }
        .rte-content ul { list-style: disc; padding-left: 1.25rem; }
        .rte-content ol { list-style: decimal; padding-left: 1.25rem; }
        .rte-content h3 { font-weight: 700; font-size: 1.05rem; margin: .5rem 0 .25rem; }
        .rte-content b, .rte-content strong { font-weight: 700; }
      `}</style>
    </div>
  );
}
