import type { CompanyInfoData } from "@/lib/api";

/**
 * Sinh script Google Tag Manager (head + noscript body).
 * Theo chuẩn chính thức của Google: https://developers.google.com/tag-platform/tag-manager/web
 */
export function generateGtmScripts(containerId: string) {
  return {
    head: `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');</script>
<!-- End Google Tag Manager -->`,
    body: `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`,
  };
}

/**
 * Sinh script Google Ads global site tag + config.
 */
export function generateGoogleAdsScript(conversionId: string) {
  return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${conversionId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${conversionId}');
</script>`;
}

/**
 * Sinh sự kiện conversion cho nút gọi (dùng trong onClick).
 */
export function generateCallConversionEvent(conversionLabel: string) {
  return `gtag('event', 'conversion', {'send_to': '${conversionLabel}'});`;
}

/**
 * Sinh script Facebook Pixel base code.
 */
export function generateFacebookPixelScript(pixelId: string) {
  return `<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->`;
}

/**
 * Tập hợp tất cả tracking scripts từ config.
 * Trả về { headScripts, bodyScripts, callConversionSnippet } để layout dùng.
 */
export function buildTrackingScripts(tracking?: CompanyInfoData["tracking"]) {
  const headScripts: string[] = [];
  const bodyScripts: string[] = [];
  let callConversionSnippet = "";

  if (!tracking) return { headScripts, bodyScripts, callConversionSnippet };

  // Google Tag Manager
  if (tracking.googleTagManager?.enabled && tracking.googleTagManager.containerId) {
    const gtm = generateGtmScripts(tracking.googleTagManager.containerId);
    headScripts.push(gtm.head);
    bodyScripts.push(gtm.body);
  }

  // Google Ads
  if (tracking.googleAds?.enabled && tracking.googleAds.conversionId) {
    headScripts.push(generateGoogleAdsScript(tracking.googleAds.conversionId));
    if (tracking.googleAds.conversionLabel) {
      callConversionSnippet = generateCallConversionEvent(tracking.googleAds.conversionLabel);
    }
  }

  // Facebook Pixel
  if (tracking.facebookPixel?.enabled && tracking.facebookPixel.pixelId) {
    headScripts.push(generateFacebookPixelScript(tracking.facebookPixel.pixelId));
  }

  // Custom scripts
  if (tracking.customHeadScripts?.trim()) {
    headScripts.push(tracking.customHeadScripts.trim());
  }
  if (tracking.customBodyScripts?.trim()) {
    bodyScripts.push(tracking.customBodyScripts.trim());
  }

  return { headScripts, bodyScripts, callConversionSnippet };
}
