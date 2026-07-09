"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { useModal } from "@/contexts/ModalContext";
import { formatPrice } from "@/lib/types";
import Logo from "@/components/Logo";
import SearchOverlay from "./SearchOverlay";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About us" },
  { href: "/contact-us", label: "Contact us" },
  { href: "/shop", label: "Shop Now" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, total } = useCart();
  const { data: session } = useSession();
  const { openLogin, openCartSidebar } = useModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className={`site-header ${scrolled ? "is-sticky" : ""}`}>
        <div className="header-inner">
          <div className="container header-container">
            <nav className="header-nav desktop-only" aria-label="Main navigation">
              <ul>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={isActive(link.href) ? "active" : ""}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              className="mobile-menu-btn mobile-only"
              aria-label="Open mobile menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                <rect width="20" height="2" fill="currentColor" />
                <rect y="6" width="20" height="2" fill="currentColor" />
                <rect y="12" width="20" height="2" fill="currentColor" />
              </svg>
              <span>Menu</span>
            </button>

            <div className="header-logo">
              <Logo variant="header" className="logo-desktop" />
              <Logo variant="compact" className="logo-mobile" />
            </div>

            <div className="header-tools desktop-only">
              {session?.user ? (
                <div className="header-account-menu">
                  <Link href="/my-account" className="header-tool">
                    <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                      <circle cx="9" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M1 19c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span>
                      {session.user.role === "admin"
                        ? "Account"
                        : (session.user.name?.split(" ")[0] ?? "Account")}
                    </span>
                  </Link>
                  {session.user.role === "admin" && (
                    <Link href="/admin" className="header-tool">
                      Admin
                    </Link>
                  )}
                  <button
                    className="header-tool header-logout"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button className="header-tool" onClick={openLogin}>
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <circle cx="9" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M1 19c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span>Login / Register</span>
                </button>
              )}
              <button className="header-tool header-cart" onClick={openCartSidebar}>
                <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                  <path d="M1 1h3l2 13h10l2-9H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                  <circle cx="16" cy="20" r="1.5" fill="currentColor" />
                </svg>
                <span className="cart-info">
                  <span className="cart-count">
                    {itemCount} <span>items</span>
                  </span>
                  <span className="cart-total">{formatPrice(total)}</span>
                </span>
              </button>
              <button
                className="header-tool"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Search</span>
              </button>
            </div>

            <button className="header-cart mobile-only" onClick={openCartSidebar}>
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                <path d="M1 1h3l2 13h10l2-9H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                <circle cx="16" cy="20" r="1.5" fill="currentColor" />
              </svg>
              <span className="cart-count-mobile">{itemCount}</span>
            </button>
          </div>
        </div>
      </header>

      {scrolled && (
        <header className="site-header header-clone">
          <div className="header-inner">
            <div className="container header-container clone-layout">
              <button
                className="mobile-menu-btn mobile-only"
                aria-label="Open mobile menu"
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  <rect width="20" height="2" fill="currentColor" />
                  <rect y="6" width="20" height="2" fill="currentColor" />
                  <rect y="12" width="20" height="2" fill="currentColor" />
                </svg>
                <span>Menu</span>
              </button>

              <div className="clone-logo desktop-only">
                <Logo variant="compact" />
              </div>
              <div className="header-logo clone-logo-mobile mobile-only">
                <Logo variant="compact" />
              </div>

              <nav className="header-nav desktop-only" aria-label="Sticky navigation">
                <ul>
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={isActive(link.href) ? "active" : ""}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="header-tools desktop-only">
                {session?.user ? (
                  <Link href="/my-account" className="header-tool">
                    {session.user.name?.split(" ")[0] ?? "Account"}
                  </Link>
                ) : (
                  <button className="header-tool" onClick={openLogin}>
                    Login / Register
                  </button>
                )}
                <button className="header-tool header-cart" onClick={openCartSidebar}>
                  {itemCount} items
                </button>
                <button className="header-tool" onClick={() => setSearchOpen(true)}>
                  Search
                </button>
              </div>

              <button className="header-cart mobile-only" onClick={openCartSidebar}>
                <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                  <path d="M1 1h3l2 13h10l2-9H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                  <circle cx="16" cy="20" r="1.5" fill="currentColor" />
                </svg>
                <span className="cart-count-mobile">{itemCount}</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {mobileMenuOpen && (
        <div className="mobile-nav-overlay">
          <div className="mobile-nav-panel">
            <button
              className="mobile-nav-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
