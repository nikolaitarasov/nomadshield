import Script from "next/script";

function endpoint() {
  const site = process.env.NEXT_PUBLIC_GOATCOUNTER_SITE?.trim() || "nomadshield";
  if (site.startsWith("http")) return site.endsWith("/count") ? site : `${site.replace(/\/$/, "")}/count`;
  if (site.includes(".")) return `https://${site.replace(/\/count$/, "")}/count`;
  return `https://${site}.goatcounter.com/count`;
}

export function GoatCounter() {
  const src = endpoint();
  return (
    <>
      <Script
        src="https://gc.zgo.at/count.js"
        strategy="afterInteractive"
        {...{ "data-goatcounter": src }}
      />
      <noscript>
        {/* GoatCounter fallback pixel */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${src}?p=/noscript`} alt="" className="hidden" />
      </noscript>
    </>
  );
}
