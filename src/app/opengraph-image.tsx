import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "The Talented Mr. Szamowski — Marketing & Growth Leader, Fullstack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #050a08 0%, #0a1f14 50%, #1d392b 100%)",
          fontFamily: "monospace",
        }}
      >
        {/* Terminal prompt icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "12px",
              background: "#0a1510",
              border: "2px solid #0ddf72",
              fontSize: "36px",
              color: "#0ddf72",
              fontWeight: 700,
            }}
          >
            $_
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: "#0ddf72",
              lineHeight: 1.1,
            }}
          >
            The Talented Mr. Szamowski
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#dafce0",
              opacity: 0.9,
              lineHeight: 1.4,
            }}
          >
            Maciej Szamowski
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "32px",
            flexWrap: "wrap",
          }}
        >
          {[
            "Marketing & Growth Leader",
            "Fullstack Developer",
            "Digital One Man Army",
          ].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(13, 223, 114, 0.4)",
                background: "rgba(13, 223, 114, 0.1)",
                color: "#0ddf72",
                fontSize: "20px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: "22px",
            color: "rgba(218, 252, 224, 0.5)",
          }}
        >
          szamowski.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
