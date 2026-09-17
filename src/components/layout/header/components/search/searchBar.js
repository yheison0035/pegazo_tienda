"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import useProducts from "@/lib/utils/api/hooks/useProducts";
import SearchResults from "./searchResult";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  const { searchProducts, loading } = useProducts();
  const containerRef = useRef(null);

  useEffect(() => {
    async function run() {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      const res = await searchProducts(query);
      if (res?.success && Array.isArray(res.data)) {
        setResults(res.data);
      } else if (Array.isArray(res)) {
        setResults(res);
      } else {
        setResults([]);
      }
    }
    run();
  }, [query, searchProducts]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (results.length > 0) setOpen(true);
  }, [results]);

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl">
      {/* Barra estilo Mercado Libre: input + botón de búsqueda con color de marca */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (results.length > 0) setOpen(true);
        }}
        className="
          flex w-full items-stretch overflow-hidden
          rounded-lg border border-(--border-soft) bg-(--bg-page)
          shadow-(--shadow-sm) transition
          focus-within:border-(--brand-primary)
          focus-within:ring-2 focus-within:ring-(--brand-primary)/30
        "
      >
        <input
          type="search"
          aria-label="Buscar productos"
          placeholder="Estoy buscando…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="
            min-w-0 flex-1
            bg-transparent px-4 py-2.5
            text-(--text-primary) placeholder:text-(--text-muted)
            outline-none
          "
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="
            flex flex-none items-center justify-center
            px-4 sm:px-6
            bg-(--cta-primary) text-(--text-inverted)
            transition hover:bg-(--cta-primary-hover)
            cursor-pointer
          "
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </form>

      {open && results.length > 0 && (
        <SearchResults results={results} loading={loading} />
      )}
    </div>
  );
}
