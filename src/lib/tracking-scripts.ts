import type { CompanyInfoData } from "@/lib/api";

function generateGtmInlineJs(containerId: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');`;
}

function generateGtmNoscriptHtml(containerId: string): string {
  return `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
}

function generateGoogleAdsExternalSrc(conversionId: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
}

function generateGoogleAdsInlineJs(conversionId: string): string {
  return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${conversionId}');`;
}

export function generateCallConversionEvent(conversionLabel: string): string {
  return `gtag('event', 'conversion', {'send_to': '${conversionLabel}'});`;
}

function generateFacebookPixelInlineJs(pixelId: string): string {
  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
}

function generateFacebookPixelNoscriptHtml(pixelId: string): string {
  return `<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>`;
}

export interface TrackingOutput {
  headInlineScripts: string[];
  headExternalScripts: string[];
  bodyScripts: string[];
  callConversionSnippet: string;
}

export function buildTrackingScripts(tracking?: CompanyInfoData["tracking"]): TrackingOutput {
  const headInlineScripts: string[] = [];
  const headExternalScripts: string[] = [];
  const bodyScripts: string[] = [];
  let callConversionSnippet = "";

  if (!tracking) return { headInlineScripts, headExternalScripts, bodyScripts, callConversionSnippet };

  if (tracking.googleTagManager?.enabled && tracking.googleTagManager.containerId) {
    const id = tracking.googleTagManager.containerId;
    headInlineScripts.push(generateGtmInlineJs(id));
    bodyScripts.push(generateGtmNoscriptHtml(id));
  }

  if (tracking.googleAds?.enabled && tracking.googleAds.conversionId) {
    const id = tracking.googleAds.conversionId;
    headExternalScripts.push(generateGoogleAdsExternalSrc(id));
    headInlineScripts.push(generateGoogleAdsInlineJs(id));
    if (tracking.googleAds.conversionLabel) {
      callConversionSnippet = generateCallConversionEvent(tracking.googleAds.conversionLabel);
    }
  }

  if (tracking.facebookPixel?.enabled && tracking.facebookPixel.pixelId) {
    const id = tracking.facebookPixel.pixelId;
    headInlineScripts.push(generateFacebookPixelInlineJs(id));
    bodyScripts.push(generateFacebookPixelNoscriptHtml(id));
  }

  if (tracking.customHeadScripts?.trim()) {
    headInlineScripts.push(tracking.customHeadScripts.trim());
  }
  if (tracking.customBodyScripts?.trim()) {
    bodyScripts.push(tracking.customBodyScripts.trim());
  }

  return { headInlineScripts, headExternalScripts, bodyScripts, callConversionSnippet };
}
