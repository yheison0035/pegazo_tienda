"use client";

import { useSearchParams, useRouter } from "next/navigation";

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  function toggle(key, value) {
    const params = new URLSearchParams(searchParams);
    const values = (params.get(key) || "").split(",").filter(Boolean);

    if (values.includes(value)) {
      const updated = values.filter((v) => v !== value);
      updated.length ? params.set(key, updated.join(",")) : params.delete(key);
    } else {
      params.set(key, [...values, value].join(","));
    }

    router.push(`?${params.toString()}`);
  }

  function get(key) {
    return searchParams.get(key) || "";
  }

  function set(key, value) {
    const params = new URLSearchParams(searchParams);
    value ? params.set(key, value) : params.delete(key);
    router.push(`?${params.toString()}`);
  }

  // Aplica varios parámetros en una sola navegación (p. ej. minPrice + maxPrice).
  function setMany(entries) {
    const params = new URLSearchParams(searchParams);
    Object.entries(entries).forEach(([key, value]) => {
      value ? params.set(key, value) : params.delete(key);
    });
    router.push(`?${params.toString()}`);
  }

  function clearAll() {
    // Conserva el orden (sort) porque no es un filtro; limpia el resto.
    const params = new URLSearchParams(searchParams);
    const sort = params.get("sort");
    [...params.keys()].forEach((key) => params.delete(key));
    if (sort) params.set("sort", sort);
    router.push(`?${params.toString()}`);
  }

  function has(key, value) {
    return (searchParams.get(key) || "").split(",").includes(value);
  }

  // Cuenta solo filtros reales (el orden no cuenta como filtro).
  const count = [...searchParams.entries()].reduce((acc, [key, value]) => {
    if (!value || key === "sort") return acc;
    return acc + value.split(",").filter(Boolean).length;
  }, 0);

  return { toggle, set, setMany, get, has, clearAll, count };
}
