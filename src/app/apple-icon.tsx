import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050a08",
          borderRadius: "36px",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            fontSize: "100px",
            fontWeight: 700,
            color: "#0ddf72",
          }}
        >
          $_
        </div>
      </div>
    ),
    { ...size }
  );
}
