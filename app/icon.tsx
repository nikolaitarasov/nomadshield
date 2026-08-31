import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07090c",
          borderRadius: 8,
          color: "#34d399",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        N
      </div>
    ),
    size,
  );
}
