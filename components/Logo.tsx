import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "header" | "footer" | "compact";
  className?: string;
}

const LOGO_SIZES = {
  header: { width: 360, height: 100 },
  compact: { width: 220, height: 56 },
  footer: { width: 400, height: 120 },
} as const;

export default function Logo({
  variant = "header",
  className = "",
}: LogoProps) {
  const size = LOGO_SIZES[variant];
  const src =
    variant === "footer" ? "/assets/logo-footer.png" : "/assets/logo-header.png";

  return (
    <Link
      href="/"
      className={`site-logo site-logo--${variant} ${className}`.trim()}
      aria-label="prospshop"
    >
      <Image
        src={src}
        alt="prospshop — Indian Style · Global Fashion"
        width={size.width}
        height={size.height}
        className="site-logo-image"
        priority={variant === "header" || variant === "compact"}
      />
    </Link>
  );
}
