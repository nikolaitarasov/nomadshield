import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07090c",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 112,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "6px solid #34d399",
            borderRadius: 28,
            color: "#34d399",
            fontSize: 72,
            fontWeight: 700,
          }}
        >
          N
        </div>
      </div>
    ),
    size,
  );
}
