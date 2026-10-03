import Link from "next/link";
import Logo from "@/components/Logo";

const FOOTER_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/refund-and-cancellation-policy", label: "Refund and Cancellation Policy" },
  { href: "/return-policy", label: "Return Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Logo variant="footer" />
          <p className="footer-desc">
            Tradexel Digitech Private Limited is a women&apos;s fashion destination
            celebrating the elegance of traditional sarees. We offer a curated
            collection that blends heritage with modern style. Our mission is to
            provide high-quality, stylish sarees that empower every woman to feel
            confident, graceful, and beautiful on every special occasion.
          </p>
          <p className="footer-address">
            TRADEXEL DIGITECH PRIVATE LIMITED
            <br />
            3/180, Mariyammkoil, Muniyappampalayam
            <br />
            Sankari, Salem, Tamil Nadu - 637301
          </p>
          <nav className="footer-links" aria-label="Footer policies">
            <ul>
              {FOOTER_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="footer-copyright">
        <div className="container">
          <p>
            &copy; {new Date().getFullYear()} | Tradexel Digitech Private Limited.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
