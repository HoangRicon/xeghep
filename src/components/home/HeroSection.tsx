import Image from "next/image";
import { COMPANY_INFO } from "@/data/company-info";
import type { CompanyInfoData } from "@/lib/api";

interface HeroSectionProps {
  companyInfo?: CompanyInfoData;
}

export function HeroSection({ companyInfo = COMPANY_INFO }: HeroSectionProps) {
  const info = companyInfo ?? COMPANY_INFO;

  return (
    <section
      aria-label="Ảnh banner xe ghép liên tỉnh"
      className="w-full bg-white"
    >
      <Image
        src={info.heroImageUrl}
        alt={info.heroImageAlt}
        width={info.heroImageWidth}
        height={info.heroImageHeight}
        priority
        sizes="(max-width: 1280px) 100vw, 1280px"
        quality={85}
        className="mx-auto block h-auto w-full lg:h-[64vh] lg:max-h-[640px] lg:max-w-7xl lg:object-contain"
      />
    </section>
  );
}
