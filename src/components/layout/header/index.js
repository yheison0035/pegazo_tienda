"use client";
import HeaderTop from "./components/headerTop";
import HeaderNav from "./components/headerNav";
import { forwardRef } from "react";

const Header = forwardRef(function Header({ navRef }, headerRef) {
  return (
    <header
      ref={headerRef}
      style={{ top: "var(--edit-bar-h, 0px)" }}
      className="
        fixed left-0 w-full z-50
        bg-(--bg-page)
        border-b border-(--border-soft)
      "
    >
      <HeaderTop />
      <div ref={navRef}>
        <HeaderNav />
      </div>
    </header>
  );
});

export default Header;
