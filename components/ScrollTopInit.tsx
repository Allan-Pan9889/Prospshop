"use client";

import { useEffect } from "react";

export default function ScrollTopInit() {
  useEffect(() => {
    const btn = document.getElementById("scroll-top");
    if (!btn) return;

    const onScroll = () => {
      if (window.scrollY > 400) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    };

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
