import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { BookingActivityToast } from "@/components/layout/BookingActivityToast";
import { BookingSupportPopup } from "@/components/layout/BookingSupportPopup";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildGlobalBusinessSchema } from "@/lib/schema";
import {
  BRAND_NAME,
  normalizeSiteDomain,
  getFallbackSiteDomain,
} from "@/lib/seo";
import { getRoutes, getCompanySettings, getCustomCode } from "@/lib/api";
import { buildHeadInjectionScript } from "@/lib/custom-code";
import { buildTrackingScripts } from "@/lib/tracking-scripts";

// Đồng bộ lại nội dung Payload/Postgres định kỳ mà không cần build lại toàn bộ site.
export const revalidate = 60;

const fontSans = Be_Vietnam_Pro({
  weight: ["400", "600", "700", "900"],
  subsets: ["vietnamese"],
  display: "swap",
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#dc2626",
};

/**
 * Root Layout Metadata
 * NOTE: Strictly obeys AGENTS.md rule 1.3 & 14.1:
 * DO NOT define `alternates.canonical` in root layout to prevent incorrect inheritance across child routes!
 */
export async function generateMetadata(): Promise<Metadata> {
  const { info } = await getCompanySettings();
  const brandName = info.brandName || BRAND_NAME;
  const siteDomain =
    normalizeSiteDomain(info.website) || getFallbackSiteDomain();
  const ogImage =
    info.defaultOgImageUrl || `${siteDomain}/images/og-xe-ghep-lien-tinh.webp`;

  return {
    metadataBase: new URL(siteDomain),
    title: {
      template: `%s | ${brandName}`,
      default: `${brandName} - Tiện Chuyến, Bao Xe 4-7 Chỗ Đời Mới 24/7`,
    },
    description:
      info.summary ||
      "Dịch vụ xe ghép liên tỉnh chuyên tuyến Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội. Đưa đón tận nhà, xe đời mới, giá trọn gói, phục vụ 24/7.",
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: brandName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${brandName} - Dịch vụ xe ghép liên tỉnh đón trả tận nơi`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/icon.svg",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [companySettings, routes, customCode] = await Promise.all([
    getCompanySettings(),
    getRoutes(),
    getCustomCode(),
  ]);
  const globalSchema = buildGlobalBusinessSchema(companySettings);
  const tracking = buildTrackingScripts(companySettings.info.tracking);

  return (
    <html lang="vi" className={fontSans.variable}>
      <head>
        <meta charSet="UTF-8" />
        {/* Tracking scripts từ admin */}
        {tracking.headExternalScripts.map((src, i) => (
          <script key={`tracking-ext-${i}`} src={src} async />
        ))}
        {tracking.headInlineScripts.map((js, i) => (
          <script
            key={`tracking-inline-${i}`}
            dangerouslySetInnerHTML={{ __html: js }}
          />
        ))}

        {/* AutoAds widget → chuyển vào CMS Custom Code > Head */}

        {customCode.headCode.trim() && (
          <script
            id="custom-code-head-injection"
            dangerouslySetInnerHTML={{
              __html: buildHeadInjectionScript(customCode.headCode),
            }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased text-slate-900 bg-white selection:bg-red-100 selection:text-red-900">
        {customCode.bodyStartCode.trim() && (
          <div
            data-custom-code="body-start"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: customCode.bodyStartCode }}
          />
        )}
        {/* Tracking body scripts (GTM noscript, etc.) */}
        {tracking.bodyScripts.map((script, i) => (
          <div
            key={`tracking-body-${i}`}
            data-tracking="body"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: script }}
          />
        ))}
        <JsonLd data={globalSchema} />
        <Header routes={routes} companyInfo={companySettings.info} />
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <Footer companyInfo={companySettings.info} />
        <FloatingContact
          companyInfo={companySettings.info}
          callConversionSnippet={tracking.callConversionSnippet}
        />
        <BookingActivityToast />
        <BookingSupportPopup companyInfo={companySettings.info} />
        {customCode.bodyEndCode.trim() && (
          <div
            data-custom-code="body-end"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: customCode.bodyEndCode }}
          />
        )}
      </body>
    </html>
  );
}
