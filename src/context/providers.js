"use client";

import { CartProvider } from "./cartContext";
import { WebsiteProvider } from "./websiteContext";
import { CustomerProvider } from "./customerContext";

export default function Providers({ children, initialWebsite = null }) {
  return (
    <WebsiteProvider initialWebsite={initialWebsite}>
      <CustomerProvider>
        <CartProvider>{children}</CartProvider>
      </CustomerProvider>
    </WebsiteProvider>
  );
}
