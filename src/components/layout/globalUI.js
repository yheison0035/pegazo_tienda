"use client";

import { useState } from "react";
import WhatsAppFloating from "../ui/whatsAppFloating";
import CookieConsent from "../ui/cookieConsent";
import EditBar from "../ui/editBar";

export default function GlobalUI() {
  const [cookieVisible, setCookieVisible] = useState(false);

  return (
    <>
      <EditBar />
      <WhatsAppFloating offsetBottom={cookieVisible ? 110 : 20} />
      <CookieConsent onVisibleChange={setCookieVisible} />
    </>
  );
}
