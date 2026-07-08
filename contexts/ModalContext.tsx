"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/types";

interface ModalContextValue {
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  cartSidebarOpen: boolean;
  openCartSidebar: () => void;
  closeCartSidebar: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);

  const openQuickView = useCallback((p: Product) => setQuickViewProduct(p), []);
  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);
  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);
  const openCartSidebar = useCallback(() => setCartSidebarOpen(true), []);
  const closeCartSidebar = useCallback(() => setCartSidebarOpen(false), []);

  return (
    <ModalContext.Provider
      value={{
        quickViewProduct,
        openQuickView,
        closeQuickView,
        loginOpen,
        openLogin,
        closeLogin,
        cartSidebarOpen,
        openCartSidebar,
        closeCartSidebar,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}
