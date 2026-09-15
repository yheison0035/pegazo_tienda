"use client";

import Image from "next/image";
import SearchBar from "./search/searchBar";
import UserIcon from "./userIcon";
import CartIcon from "./cartIcon";
import FavoritesIcon from "./favoritesIcon";
import TrackOrder from "./trackOrder";
import { useCart } from "@/context/cartContext";
import Link from "next/link";

import { getCompanyName, getLogo } from "@/lib/website";
import { useWebsiteContext } from "@/context/websiteContext";

export default function HeaderTop() {
  const { count } = useCart();

  const { website } = useWebsiteContext();

  // No se oculta mientras carga: si el header desaparece y vuelve, cambia de
  // altura y el contenido de abajo se descoloca.
  return (
    <div
      className="
        max-w-7xl mx-auto px-4 py-4
        grid grid-cols-1 gap-4
        md:grid-cols-[auto_1fr_auto]
        md:items-center
      "
    >
      <Link href="/">
        <div className="flex justify-center md:justify-start cursor-pointer">
          <Image
            src={getLogo(website)}
            alt={getCompanyName(website)}
            width={70}
            height={70}
            priority
          />
        </div>
      </Link>

      <div className="flex justify-center w-full">
        <SearchBar />
      </div>

      <div className="flex items-center justify-center md:justify-end gap-2 sm:gap-3 text-(--text-primary)">
        <TrackOrder />
        <FavoritesIcon />
        <UserIcon />
        <CartIcon count={count} />
      </div>
    </div>
  );
}
