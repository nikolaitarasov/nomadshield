import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "NomadShield — SavvyNomad alternative for US digital nomads";

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#34d399",
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          NomadShield
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 58, fontWeight: 650, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            Leave the high-tax state.
            <br />
            Keep the proof.
          </div>
          <div style={{ fontSize: 24, color: "#8b97a8", maxWidth: 820 }}>
            SavvyNomad alternative — self-serve domicile playbooks and a 183-day audit vault. Keep your mailbox.
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, color: "#34d399", fontSize: 20 }}>
          <span>Free calculator</span>
          <span>$49 kit</span>
          <span>$19/mo Shield</span>
        </div>
      </div>
    ),
    size,
  );
}
