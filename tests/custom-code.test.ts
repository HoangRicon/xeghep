// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { runInContext, type Context } from "node:vm";
import { buildHeadInjectionScript } from "@/lib/custom-code";

// Dùng cùng realm với script DOM, tránh global/window proxy của Vitest.
const dom = Reflect.get(globalThis, "jsdom") as { getInternalVMContext(): Context };

afterEach(() => {
  document.head.innerHTML = "";
});

describe("Custom Code head injection", () => {
  it("executes a GTM HTML snippet and preserves the existing data layer", () => {
    document.head.innerHTML = "<script></script>";
    const existingEvent = { event: "existing" };
    runInContext('window.dataLayer = [{event: "existing"}]', dom.getInternalVMContext());
    const snippet = `<script>
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-TEST123');
    </script>`;

    runInContext(buildHeadInjectionScript(snippet), dom.getInternalVMContext());

    expect(document.querySelector('script[src="https://www.googletagmanager.com/gtm.js?id=GTM-TEST123"]')).not.toBeNull();
    expect(runInContext("window.dataLayer", dom.getInternalVMContext())).toEqual([
      existingEvent,
      expect.objectContaining({ event: "gtm.js" }),
    ]);
  });

  it("retains meta/style content and does not let HTML terminate the injection script", () => {
    const script = buildHeadInjectionScript('<meta name="test" content="ok"><style>.test{color:red}</style><script>/* </script> */</script>');
    expect(script).not.toContain("</script>");
    window.eval(buildHeadInjectionScript('<meta name="test" content="ok"><style>.test{color:red}</style>'));
    expect(document.querySelector('meta[name="test"]')?.getAttribute("content")).toBe("ok");
    expect(document.querySelector("style")?.textContent).toBe(".test{color:red}");
  });
});
