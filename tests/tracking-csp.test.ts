import { describe, expect, it, vi } from "vitest";

vi.mock("@payloadcms/next/withPayload", () => ({ withPayload: (config: unknown) => config }));
import nextConfig from "../next.config";

async function allows(directive: string, address: string) {
  const rules = await nextConfig.headers!();
  const csp = rules.find((rule) => rule.source === "/(.*)")!.headers
    .find((header) => header.key === "Content-Security-Policy")!.value;
  const directives = new Map(csp.split(";").map((part) => {
    const [name, ...sources] = part.trim().split(/\s+/);
    return [name, sources];
  }));
  const sources = directives.get(directive) ?? directives.get("default-src") ?? [];
  const target = new URL(address);
  return sources.some((source) => {
    if (!source.startsWith("https://")) return false;
    const allowed = new URL(source);
    return allowed.protocol === target.protocol && (allowed.host === target.host ||
      (allowed.hostname.startsWith("*.") && target.hostname.endsWith(allowed.hostname.slice(1))));
  });
}

describe("CSP for Google tracking", () => {
  it.each([
    ["script-src", "https://www.googletagmanager.com/gtm.js"],
    ["script-src", "https://www.googleadservices.com/pagead/conversion.js"],
    ["script-src", "https://tagmanager.google.com/debug.js"],
    ["connect-src", "https://region1.google-analytics.com/g/collect"],
    ["connect-src", "https://www.analytics.google.com/g/collect"],
    ["connect-src", "https://www.googleadservices.com/pagead/conversion/123/"],
    ["connect-src", "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/123/"],
    ["frame-src", "https://www.googletagmanager.com/ns.html"],
  ])("allows %s for %s", async (directive, address) => {
    expect(await allows(directive, address)).toBe(true);
  });

  it("still blocks unrelated third-party scripts and connections", async () => {
    expect(await allows("script-src", "https://untrusted.example/script.js")).toBe(false);
    expect(await allows("connect-src", "https://untrusted.example/collect")).toBe(false);
  });
});
