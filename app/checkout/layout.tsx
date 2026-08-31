import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Checkout",
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
