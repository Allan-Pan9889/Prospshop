"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { ModalProvider } from "@/contexts/ModalContext";
import QuickViewModal from "@/components/QuickViewModal";
import LoginModal from "@/components/LoginModal";
import CartSidebar from "@/components/CartSidebar";

function StoreModals() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <QuickViewModal />
      <LoginModal />
      <CartSidebar />
    </>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <ModalProvider>
          {children}
          <StoreModals />
        </ModalProvider>
      </CartProvider>
    </SessionProvider>
  );
}
