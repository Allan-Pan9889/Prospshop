import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import SiteChrome from "@/components/SiteChrome";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Prospirete Crest Technologies Private Limited | Woman Fashion Store – Woman Fashion Collection Kurtis and Sharee",
  description:
    "Prospirete Crest Technologies Private Limited is a women's fashion destination celebrating the elegance of traditional sarees.",
};

export const viewport = {
  themeColor: "rgb(60,61,55)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body className={jost.variable}>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
