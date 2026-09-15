"use client";

import { CartProvider } from "./cartContext";
import { WebsiteProvider } from "./websiteContext";
import { CustomerProvider } from "./customerContext";
import { EditModeProvider } from "./editModeContext";

export default function Providers({ children, initialWebsite = null }) {
  return (
    <WebsiteProvider initialWebsite={initialWebsite}>
      <CustomerProvider>
        <EditModeProvider>
          <CartProvider>{children}</CartProvider>
        </EditModeProvider>
      </CustomerProvider>
    </WebsiteProvider>
  );
}
