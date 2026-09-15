"use client";

import { CartProvider } from "./cartContext";
import { WebsiteProvider } from "./websiteContext";
import { CustomerProvider } from "./customerContext";
import { EditModeProvider } from "./editModeContext";
import { FavoritesProvider } from "./favoritesContext";

export default function Providers({ children, initialWebsite = null }) {
  return (
    <WebsiteProvider initialWebsite={initialWebsite}>
      <CustomerProvider>
        <FavoritesProvider>
          <EditModeProvider>
            <CartProvider>{children}</CartProvider>
          </EditModeProvider>
        </FavoritesProvider>
      </CustomerProvider>
    </WebsiteProvider>
  );
}
