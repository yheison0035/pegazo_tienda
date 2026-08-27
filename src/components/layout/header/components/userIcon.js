"use client";

import Link from "next/link";
import { UserIcon as UserOutlineIcon } from "@heroicons/react/24/outline";
import { useCustomer } from "@/context/customerContext";

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function UserIcon() {
  const { customer, isAuthenticated } = useCustomer();

  return (
    <Link
      href="/mi-cuenta"
      aria-label={isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
      title={isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
      className="flex items-center gap-2 text-(--text-primary) hover:text-(--brand-accent) transition"
    >
      {isAuthenticated ? (
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-(--brand-accent) text-sm font-bold text-white"
          aria-hidden
        >
          {initials(customer?.name) || (
            <UserOutlineIcon className="h-5 w-5" />
          )}
        </span>
      ) : (
        <UserOutlineIcon className="h-6 w-6 cursor-pointer" />
      )}
    </Link>
  );
}
