"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import MobileToolbar from "@/components/MobileToolbar";
import ScrollTopInit from "@/components/ScrollTopInit";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="site-wrapper">
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
        <CookieBanner />
        <MobileToolbar />
      </div>
      <button className="scroll-top" aria-label="Scroll to top" id="scroll-top">
        ↑
      </button>
      <ScrollTopInit />
    </>
  );
}
