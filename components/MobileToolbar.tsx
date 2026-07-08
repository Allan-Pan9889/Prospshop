"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { useModal } from "@/contexts/ModalContext";

export default function MobileToolbar() {
  const { itemCount } = useCart();
  const { data: session } = useSession();
  const { openLogin } = useModal();

  return (
    <div className="mobile-toolbar mobile-only">
      <Link href="/shop" className="toolbar-item">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 3h3l1.5 9h9l1.5-6H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Shop</span>
      </Link>
      <Link href="/basket" className="toolbar-item">
        <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
          <path d="M1 1h3l2 13h10l2-9H6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="20" r="1.5" fill="currentColor" />
          <circle cx="16" cy="20" r="1.5" fill="currentColor" />
        </svg>
        <span>{itemCount} items Cart</span>
      </Link>
      {session?.user ? (
        <Link href="/my-account" className="toolbar-item">
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
            <circle cx="9" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M1 19c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>My account</span>
        </Link>
      ) : (
        <button className="toolbar-item toolbar-btn" onClick={openLogin}>
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
            <circle cx="9" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M1 19c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>My account</span>
        </button>
      )}
    </div>
  );
}
