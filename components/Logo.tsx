import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "header" | "footer" | "compact";
  className?: string;
}

/** Aspect ~5.07:1 after crop (2049×404) */
const LOGO_SIZES = {
  header: { width: 244, height: 48 },
  compact: { width: 183, height: 36 },
  footer: { width: 284, height: 56 },
} as const;

export default function Logo({
  variant = "header",
  className = "",
}: LogoProps) {
  const size = LOGO_SIZES[variant];
  const src =
    variant === "footer" ? "/assets/logo-footer.png" : "/assets/tradexel.png";

  return (
    <Link
      href="/"
      className={`site-logo site-logo--${variant} ${className}`.trim()}
      aria-label="Tradexel"
    >
      <Image
        src={src}
        alt="Tradexel"
        width={size.width}
        height={size.height}
        className="site-logo-image"
        priority={variant === "header" || variant === "compact"}
      />
    </Link>
  );
}
