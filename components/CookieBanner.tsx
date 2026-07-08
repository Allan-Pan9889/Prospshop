"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookies-accepted");
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookies-accepted", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-inner">
        <p>
          We use cookies to improve your experience on our website. By browsing
          this website, you agree to our use of cookies.
        </p>
        <button className="btn btn-default cookie-accept" onClick={accept}>
          Accept
        </button>
      </div>
    </div>
  );
}
