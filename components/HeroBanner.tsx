import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="hero-banners">
      <div className="banner-full">
        <Image
          src="/assets/banner-4.png"
          alt="Banner"
          width={1920}
          height={600}
          className="banner-img"
          priority
        />
      </div>
      <div className="banner-full banner-second">
        <Image
          src="/assets/banner-16.png"
          alt="Banner"
          width={1920}
          height={400}
          className="banner-img"
        />
      </div>
    </section>
  );
}
