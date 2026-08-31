"use client";

import { useEffect } from "react";

const SRC = "https://analytics.ahrefs.com/analytics.js";
const KEY = "SDt/fK+IdahlI3YEnR5yjg";

export function AhrefsAnalytics() {
  useEffect(() => {
    if (document.querySelector(`script[src="${SRC}"]`)) return;
    const s = document.createElement("script");
    s.src = SRC;
    s.setAttribute("data-key", KEY);
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return null;
}
