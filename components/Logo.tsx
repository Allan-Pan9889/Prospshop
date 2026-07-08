import Link from "next/link";

interface LogoProps {
  variant?: "header" | "footer" | "compact";
  className?: string;
}

export default function Logo({
  variant = "header",
  className = "",
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`site-logo site-logo--${variant} ${className}`.trim()}
      aria-label="prospshop.com"
    >
      <span className="site-logo-text">prospshop.com</span>
    </Link>
  );
}
