"use client";

import { useEffect } from "react";

const ENDPOINT = "https://nomadshield.goatcounter.com/count";

export function GoatCounter() {
  useEffect(() => {
    if (document.querySelector("script[data-goatcounter]")) return;
    const s = document.createElement("script");
    s.setAttribute("data-goatcounter", ENDPOINT);
    s.async = true;
    s.src = "//gc.zgo.at/count.js";
    document.body.appendChild(s);
  }, []);

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${ENDPOINT}?p=/noscript`} alt="" className="hidden" />
    </noscript>
  );
}
