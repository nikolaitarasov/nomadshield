import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SavvyNomad alternative — NomadShield vs Savvy Nomad";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07090c",
          color: "#f3f6fa",
          padding: "64px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ color: "#34d399", fontSize: 20, fontWeight: 600, letterSpacing: "0.12em" }}>
          COMPARE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 52, fontWeight: 650, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            NomadShield and SavvyNomad
          </div>
          <div style={{ fontSize: 24, color: "#8b97a8", maxWidth: 860 }}>
            Concierge mailbox vs self-serve playbook and 183-day audit file. Keep the mailbox you already pay for.
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#34d399" }}>$49 kit · $19/mo Audit Shield · FL / TX / SD</div>
      </div>
    ),
    size,
  );
}
