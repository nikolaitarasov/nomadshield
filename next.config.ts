import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  devIndicators: { position: "bottom-right" },
  async redirects() {
    return [
      { source: "/savvynomad", destination: "/savvy-nomad", permanent: true },
      { source: "/savvy-nomad-alternative", destination: "/savvy-nomad", permanent: true },
      { source: "/savvynomad-alternative", destination: "/savvy-nomad", permanent: true },
      { source: "/savvy-nomad-review", destination: "/savvy-nomad", permanent: true },
      { source: "/savvy-nomad-pricing", destination: "/savvy-nomad", permanent: true },
      { source: "/vs/savvynomad", destination: "/savvy-nomad", permanent: true },
      { source: "/vs/savvy-nomad", destination: "/savvy-nomad", permanent: true },
      { source: "/alternatives/savvy-nomad", destination: "/savvy-nomad", permanent: true },
      { source: "/alternatives/savvynomad", destination: "/savvy-nomad", permanent: true },
    ];
  },
};

export default nextConfig;
